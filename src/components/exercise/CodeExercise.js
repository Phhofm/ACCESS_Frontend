import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import 'file-icons-js/css/style.css';
import './CodeExercise.css';
import Workspace from '../../models/Workspace';
import SubmissionService from '../../utils/SubmissionService';
import FileExplorer from './FileExplorer';
import CodeEditor from './CodeEditor';
import utils from '../../utils';

class CodeExercise extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedFile: undefined,
            fileExplorerData: demoFiles,
            workspace: undefined,

        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount = async () => {
        document.addEventListener('keydown', this.handleKeyDown);

        const { authorizationHeader, exercise } = this.props;

        const questionFile = {
            id: 'question',
            name: 'question',
            title: 'question.md',
            content: exercise.question,
            extension: 'md',
            readOnly: true,
        };

        const fileExplorerData = mapVirtualFilesToTreeStructure([questionFile].concat(exercise['public_files']));

        const submission = await this.fetchLastSubmission(exercise.id, authorizationHeader);
        const workspace = new Workspace(exercise, submission);

        this.setState({
            fileExplorerData,
            workspace,
            selectedFile: questionFile,
        });

    };

    componentWillUnmount = () => {
        document.removeEventListener('keydown', this.handleKeyDown);
    };

    fetchLastSubmission = (exerciseId, authHeader) => {
        return SubmissionService.getLastSubmission(exerciseId, authHeader)
            .catch(err => console.error(err));
    };

    onFileSelected(fileId) {
        const { fileExplorerData, workspace } = this.state;
        const selectedFile = fileId === 'question' ? fileExplorerData[0] : workspace.findFile(fileId);
        this.setState({ selectedFile });
    }

    submitButtonClick = async () => {
        console.log('Submit Button pressed');
        let { workspace } = this.state;
        const { headers } = this.props.authorizationHeader;

        let codeResponse = await SubmissionService.submitCode(workspace.exerciseId, workspace, headers);
        let submissionId = '';

        const intervalId = setInterval(async () => {
            let evalResponse = await SubmissionService.checkEvaluation(codeResponse.evalId, headers);
            if ('ok' === evalResponse.status) {
                submissionId = evalResponse.submission;
                console.debug(submissionId);
                clearInterval(intervalId);

                let submissionResponse = await SubmissionService.getSubmission(submissionId, headers);
                console.debug(submissionResponse);
                this.setState({ console: submissionResponse.console.stderr });
            }
        }, 100);
    };

    sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    /**
     * Update workspace if code gets edited by user
     */
    onChange = (newValue) => {
        const { selectedFile } = this.state;

        const { workspace } = this.state;
        let files = workspace.publicFiles.slice();
        let index = files.indexOf(selectedFile);
        let file = files[index];
        file = { ...file, content: newValue };
        files[index] = file;
        const updatedWorkspace = Object.assign(new Workspace(), workspace);
        updatedWorkspace.publicFiles = files;
        this.setState(({ workspace: updatedWorkspace, selectedFile: file }));

    };

    onFileExplorerChange = (data) => {
        this.setState({ fileExplorerData: data });
    };

    nodeClicked = (node) => {
        const fileExplorerData = this.state.fileExplorerData.map(n => {
            if (n.id === node.id && n.isDirectory) {
                return {
                    ...n,
                    expanded: !n.expanded,
                };
            } else if (n.id === node.id) {
                return {
                    ...n,
                    active: true,
                };
            }
            return n;
        });

        const selectedFile = node.id === 'question' ? this.state.fileExplorerData[0] : this.state.workspace.findFile(node.id);
        this.setState({ selectedFile, fileExplorerData });
    };

    editorOptions = (readOnly) => {
        return {
            readOnly: readOnly,
            selectOnLineNumbers: true,
            wordWrap: true,
            quickSuggestions: true,
            snippetSuggestions: true,
            wordBasedSuggestions: true,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            minimap: {
                enabled: false,
            },
        };
    };

    handleKeyDown(e) {
        // Any key ctrl + [0, 9] || cmd + [0, 9]
        if ((e.ctrlKey || e.metaKey) && e.which >= 48 && e.which <= 57) {
            e.preventDefault();
            let index = e.which - 48;
            this.selectFileByIndex(index);
        }
    };

    selectFileByIndex = (index) => {
        if (index === 1 || index === 0) {
            this.setState({ selectedFile: this.state.fileExplorerData[0] });
        } else {
            index = Math.min(index, this.state.workspace.publicFiles.length + 1);
            const selectedFile = this.state.workspace.publicFiles[index - 2];
            this.setState({ selectedFile });
        }
    };

    render() {
        const { selectedFile, workspace, fileExplorerData, console } = this.state;

        if (!selectedFile || !workspace) {
            return null;
        }

        const { content, extension } = selectedFile;
        const language = extensionLanguageMap[extension];

        const editorOptions = this.editorOptions(selectedFile.readOnly);

        const showQuestion = selectedFile.title === 'question.md';

        let fileTabs = fileExplorerData.map((f) => {
                const isSelected = f.id === selectedFile.id;
                return (
                    <button key={f.id}
                            className={`btn code-editor-workspace-tab ${isSelected ? 'active' : ''}`}
                            onClick={() => this.onFileSelected(f.id)}>
                        {f.name + '.' + f.extension}
                    </button>
                );
            },
        );

        let consoleLog = <div id="console" className="border">${console ? console.split('\n').map(s => <p
            key={s}>{s}</p>) : ''}></div>;

        return (
            <>
                <div className="row border rounded code-editor-workspace">
                    <div className="col-2">
                        <FileExplorer data={fileExplorerData} selectedFile={selectedFile}
                                      onChange={this.onFileExplorerChange}
                                      nodeClicked={this.nodeClicked}/>

                    </div>

                    <div className="col-10">
                        <div className={'row d-flex justify-content-between'}>

                            <div className="btn-group btn-group-sm" role="group" aria-label="files">
                                {fileTabs}
                            </div>

                        </div>


                        <div className="row">

                            {showQuestion &&
                            <ReactMarkdown source={workspace.question}/>
                            }
                            {!showQuestion &&
                            <CodeEditor content={content} language={language} options={editorOptions}
                                        onChange={this.onChange} onRun={this.submitButtonClick}/>
                            }

                        </div>

                        <div className="row">
                            {consoleLog}
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

/**
 * For a full list see:
 * https://github.com/microsoft/monaco-languages
 * @type {{css: string, md: string, py: string, js: string, json: string}}
 */
const extensionLanguageMap = {
    'py': 'python',
    'js': 'javascript',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
};

/**
 * Maps backend virtual files to frontend tree structure.
 *
 * Note: this should be adapted to account for folder structures in future
 * @param virtualFiles
 * @returns {*}
 */
const mapVirtualFilesToTreeStructure = (virtualFiles) => {
    return virtualFiles.map(file => ({
        ...file,
        title: `${file.name}.${file.extension}`,
    }));
};

/**
 * Should have this structure to map it to the component
 *
 * This is for demo.
 * @type {*[]}
 */
const demoFiles = [
    { id: 1, title: '.gitignore' },
    { id: 2, title: 'package.json' },
    {
        id: 3,
        title: 'src',
        isDirectory: true,
        expanded: true,
        children: [
            { id: 4, title: 'styles.css' },
            { id: 5, title: 'index.js' },
            { id: 6, title: 'reducers.js' },
            { id: 7, title: 'actions.js' },
            { id: 8, title: 'utils.js' },
        ],
    },
    {
        id: 9,
        title: 'build',
        isDirectory: true,
        children: [{ id: 12, title: 'react-sortable-tree.js' }],
    },
    {
        id: 10,
        title: 'public',
        isDirectory: true,
    },
    {
        id: 11,
        title: 'node_modules',
        isDirectory: true,
    },
];

export default CodeExercise;