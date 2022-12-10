import { Component } from "react";

export default class PhoneBook extends Component{
    constructor(props) {
        super(props)
        this.state = {
            users: [
                { name: "Rafi", phone: "0892313" },
                { name: "Farraz", phone: "081222313" }
            ]
        }
    }
    render() {
        return (
            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <h1 className="text-center">Phone Book Apps</h1>
                    </div>
                    <div className="card-body">
                        <div className="col-md-2">
                            <button type="submit" className="btn btn-primary">Add</button>
                        </div>
                        <br></br>
                        <div className="card">
                            <div className="card-header">
                                Search Form
                            </div>
                            <form className="row g-3">
                                <div className="col-auto mx-3 py-3">
                                    <label htmlFor="name" className="form-label">Name</label>
                                </div>

                                <div className="col-auto py-3">
                                    <input type="string" className="form-control" id="name"></input>
                                </div>
                                <div className="col-auto mx-3 py-3">
                                    <label htmlFor="phone" className="form-label">Phone</label>
                                </div>
                                <div className="col-auto py-3">
                                    <input type="number" className="form-control " id="phone"></input>
                                </div>
                            </form>
                        </div>



                    </div>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.users.map((user, index )=> (
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>{user.name}</td>
                                    <td>{user.phone}</td>
                                </tr>
                            ))}
                       
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}