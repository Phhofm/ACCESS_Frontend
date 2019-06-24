import React, { Component } from 'react';
import { withAuth } from '../auth/AuthProvider';
import CourseDataService from '../utils/CourseDataService';
import CodeExercise from '../components/CodeExercise';
import CodeSnippetExercise from '../components/exercise/CodeSnippetExercise';

class Exercise extends Component {

    constructor(props) {
        super(props);
        this.state = {
            exercise: undefined,
        };
    }

    componentDidMount = async () => {
        const exerciseId = this.props.match.params.exerciseId;
        const authorizationHeader = this.props.context.authorizationHeader();

        const exercise = await CourseDataService.getExercise(exerciseId, authorizationHeader);
        this.setState({ exercise });
    };

    render() {
        const { exercise } = this.state;

        if (!exercise) {
            return null;
        }

        let content = <p>unknown exercise type</p>;

        const authorizationHeader = this.props.context.authorizationHeader();
        if (exercise.type === 'code') {
            content = <CodeExercise exercise={exercise} authorizationHeader={authorizationHeader}/>;
        } else if (exercise.type === 'codeSnippet') {
            content = <CodeSnippetExercise exercise={exercise} authorizationHeader={authorizationHeader}/>;
        }

        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col">
                        Exercise list
                    </div>
                    <div className="col-9">
                        {content}
                    </div>
                    <div className="col">
                        Versions
                    </div>
                </div>
            </div>
        );
    }
}

export default withAuth(Exercise);