import React, { Component } from 'react';
import { withAuth } from '../auth/AuthProvider';
import CourseDataService from '../utils/CourseDataService';
import CodeExercise from '../components/exercise/CodeExercise';
import CodeSnippetExercise from '../components/exercise/CodeSnippetExercise';
import VersionList from '../components/exercise/VersionList';
import ExerciseList from '../components/ExerciseList';
import TextExercise from '../components/text/TextExercise';
import ChoiceExercise from '../components/choice/ChoiceExercise';
import Workspace from '../models/Workspace';
import SubmissionService from '../utils/SubmissionService';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from "@fortawesome/fontawesome-svg-core";
import { faPlay, faSpinner } from '@fortawesome/free-solid-svg-icons';

library.add(faPlay, faSpinner);

class Exercise extends Component {

    constructor(props) {
        super(props);
        this.state = {
            exercise: undefined,
            exercises: [],
            workspace: Workspace,
            runButtonState: false,
        };
        this.exerciseComponentRef = React.createRef();
    }

    componentDidMount = async () => {
        const exerciseId = this.props.match.params.exerciseId;
        const authorizationHeader = this.props.context.authorizationHeader();

        const exercise = await this.fetchExercise(exerciseId, authorizationHeader);
        const assignment = await this.fetchExerciseList(exercise, authorizationHeader);

        const submission = await this.fetchLastSubmission(exerciseId, authorizationHeader);
        const workspace = new Workspace(exercise, submission);

        this.setState({
            exercise,
            exercises: assignment.exercises,
            workspace,
        });
    };

    componentDidUpdate = async (prevProps) => {
        if (prevProps.match.params.exerciseId !== this.props.match.params.exerciseId) {
            const exerciseId = this.props.match.params.exerciseId;
            const authorizationHeader = this.props.context.authorizationHeader();

            const exercise = await this.fetchExercise(exerciseId, authorizationHeader);
            const assignment = await this.fetchExerciseList(exercise, authorizationHeader);

            const submission = await this.fetchLastSubmission(exerciseId, authorizationHeader);
            const workspace = new Workspace(exercise, submission);

            this.setState({
                exercise,
                exercises: assignment.exercises,
                workspace,
            });
        }
    };

    fetchExercise = (exerciseId, authHeader) => {
        return CourseDataService.getExercise(exerciseId, authHeader)
            .catch(err => console.error(err));
    };

    fetchExerciseList = (exercise, authHeader) => {
        return CourseDataService.getAssignment(exercise.courseId, exercise.assignmentId, authHeader)
            .catch(err => console.error(err));
    };

    fetchLastSubmission = (exerciseId, authHeader) => {
        return SubmissionService.getLastSubmission(exerciseId, authHeader)
            .catch(err => console.error(err));
    };

    fetchSubmissionById = (submissionId, authHeader) => {
        return SubmissionService.getSubmission(submissionId, authHeader)
            .catch(err => console.error(err));
    };


    loadSubmissionById = async (submissionId) => {
        let submission;
        if (submissionId === -1) {
            submission = undefined;
        } else {
            const authorizationHeader = this.props.context.authorizationHeader();
            submission = await this.fetchSubmissionById(submissionId, authorizationHeader);
        }
        const exercise = this.state.exercise;
        const workspace = new Workspace(exercise, submission);

        this.setState({ workspace });
    };

    onCodeSubmit = () => {
        this.submit(false, this.resetRunButton);
        this.setState({runButtonState: true});
    };

    resetRunButton = () => {
        this.setState({runButtonState: false});
    };

    submit = async (graded, callback) => {
        const toSubmit = this.exerciseComponentRef.current.getPublicFiles();

        let { workspace, exercise } = this.state;
        const authorizationHeader = this.props.context.authorizationHeader();

        let codeResponse = await SubmissionService.submitExercise(workspace.exerciseId, toSubmit, exercise.type, graded, authorizationHeader)
            .catch(err => console.error(err));

        const intervalId = setInterval(async () => {
            let evalResponse = await SubmissionService.checkEvaluation(codeResponse.evalId, authorizationHeader);
            if ('ok' === evalResponse.status) {
                const submissionId = evalResponse.submission;
                clearInterval(intervalId);

                const submission = await this.fetchSubmissionById(submissionId, authorizationHeader);
                const workspace = new Workspace(this.state.workspace.exercise, submission);

                this.setState({
                    workspace,
                });
                if(callback !== undefined) callback();
            }
        }, 100);
    };

    renderMainExerciseArea(exercise, authorizationHeader, workspace) {
        let content = <p>unknown exercise type</p>;

        const key = exercise.id + '-' + workspace.submissionId;

        if (exercise.type === 'code') {
            content =
                <CodeExercise
                    key={key}
                    ref={this.exerciseComponentRef}
                    exercise={exercise}
                    authorizationHeader={authorizationHeader}
                    workspace={workspace}
                />;
        } else if (exercise.type === 'codeSnippet') {
            content =
                <CodeSnippetExercise
                    key={key}
                    ref={this.exerciseComponentRef}
                    exercise={exercise}
                    authorizationHeader={authorizationHeader}
                    workspace={workspace}
                />;
        } else if (exercise.type === 'text') {
            content =
                <TextExercise
                    key={key}
                    ref={this.exerciseComponentRef}
                    exercise={exercise}
                />;
        } else if (exercise.type === 'multipleChoice') {
            content =
                <ChoiceExercise
                    key={key}
                    ref={this.exerciseComponentRef}
                    exercise={exercise}
                    authorizationHeader={authorizationHeader}
                />;
        }
        return content;
    }

    render() {
        const { exercise, exercises, workspace } = this.state;

        if (!exercise) {
            return null;
        }

        const isCodeType = exercise.type === 'code' || exercise.type === 'codeSnippet';

        const selectedId = exercise.id;
        const submissionId = workspace.submissionId;

        const authorizationHeader = this.props.context.authorizationHeader();
        const content = this.renderMainExerciseArea(exercise, authorizationHeader, workspace);
        const versionList = <VersionList exercise={exercise} authorizationHeader={authorizationHeader}
                                         submit={this.submit} selectedSubmissionId={submissionId}
                                         changeSubmissionById={this.loadSubmissionById} isCodeType={isCodeType}/>;

        
        let buttonCluster;
        if(isCodeType){
            let runButtonContent;
            if(this.state.runButtonState)
                runButtonContent = <><FontAwesomeIcon icon="spinner" spin/><span>Processing...</span></>;
            else
                runButtonContent = <><FontAwesomeIcon icon="play" /><span>Save & Run</span></>;
    

            buttonCluster = (
                <div className="row">
                    <div className="col-sm-12">
                        <div className="code-panel">
                            <button className="style-btn"  disabled={this.state.runButtonState} onClick={this.onCodeSubmit}>{runButtonContent}</button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="row">
                <div className="col-sm-2">
                    <div className={'panel'}>
                        <h4>Exercise list</h4>
                        <ExerciseList exercises={exercises} selectedId={selectedId}/>
                    </div>
                </div>
                <div className="col-sm-8">
                    <div className={'panel'}>
                        {buttonCluster}
                        {content}
                    </div>
                </div>
                <div className="col-sm-2">
                    <div className={'panel'}>
                        {versionList}
                    </div>
                </div>
            </div>
        );
    }
}

export default withAuth(Exercise);