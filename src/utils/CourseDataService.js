import {withAuth} from "../auth/AuthProvider";

class CourseDataService {

    static async initCourses() {
        console.debug("init courses");
        let courses = new Map([['31ee2054', {
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
        }], ['98140cb46cb9', {
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
        }]]);

        this.sessionStorage.courses = JSON.stringify(Array.from(courses.entries()));
    }


    static async getCourses() {
        // console.debug("constructor");
        //         // if (!sessionStorage.courses) {
        //         //     await this.initCourses();
        //         // }
        //         //
        //         // return new Map(JSON.parse(this.sessionStorage.courses)).entries();
        return  new Map([['31ee2054', {
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
        }], ['98140cb46cb9', {
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
        }]]).entries();
    }


    static async getCourse(id) {

        console.debug("constructor");
        if (!sessionStorage.courses) {
           await this.initCourses();
        }

        return new Map(JSON.parse(this.sessionStorage.courses)).get(id);
    }

}

export default withAuth(CourseDataService);