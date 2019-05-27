import React, {Component} from 'react';
import {withAuth} from '../auth/AuthProvider';
import {Link} from "react-router-dom";

class Courses extends Component {

    constructor(props) {
        super(props);
        this.state = {
            courses: [{
                "id": "31ee2054",
                "title": "Informatics 1",
                "description": "Algodat",
                "owner": "dr.prof@uzh.ch",
                "startDate": "2019-09-22T00:00:00.000+0000",
                "endDate": "2020-01-01T00:00:00.000+0000",
                "assignments": [
                    {
                        "id": "c33cd07e",
                        "title": "assignment1",
                        "description": "string manipulation lab",
                        "publishDate": "2001-12-15T00:00:00.000+0000",
                        "dueDate": "2001-05-11T00:00:00.000+0000",
                        "exercises": [
                            {
                                "id": "a4097b1f",
                                "type": "code",
                                "language": "python"
                            }
                        ]
                    }
                ]
            }, {
                "id": "98140cb46cb9",
                "title": "Informatics 2",
                "description": "Modelling",
                "owner": "dr.prof@uzh.ch",
                "startDate": "2019-09-22T00:00:00.000+0000",
                "endDate": "2020-01-01T00:00:00.000+0000",
                "assignments": [
                    {
                        "id": "981bcb2a7055",
                        "title": "assignment1",
                        "description": "string manipulation lab",
                        "publishDate": "2001-12-15T00:00:00.000+0000",
                        "dueDate": "2001-05-11T00:00:00.000+0000",
                        "exercises": [
                            {
                                "id": "8efacc61f4ea",
                                "type": "code",
                                "language": "python"
                            }
                        ]
                    }
                ]
            }],
            selected: undefined
        };
    }

    render() {
        const listItems = this.state.courses.map((c) =>
            <li>
                <Link to={`/courses/${c.id}`}>{c.title} - {c.description}</Link>
            </li>
        );

        return (
            <div className="dddd">
                <div>
                    <p>
                        My Courses:
                    </p>
                    <ul>
                        {listItems}
                    </ul>
                </div>
            </div>
        );
    }

}

export default withAuth(Courses);