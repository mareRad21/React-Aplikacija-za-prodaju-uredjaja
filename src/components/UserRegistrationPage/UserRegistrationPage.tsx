import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Alert, Button, Card, Col, Container, Form, Row} from "react-bootstrap";
import { Link } from "react-router-dom";
import api, { ApiResponse } from "../../api/api";

interface UserRegistrationState{
    formData:{
        email: string,
        password: string,
        forename: string,
        surname: string,
        phone: string,
        address: string
    },
    message?: string,
    isRegistered: boolean
}

export class UserRegistrationPage extends React.Component{
    state: UserRegistrationState;

    constructor(props: Readonly<{}>){
        super(props);
        this.state ={
            isRegistered: false,
            formData:{
                email: '',
                password: '',
                forename: '',
                surname: '',
                phone: '',
                address: ''
            },
        }    
    }

    private formInuptChange(event: React.ChangeEvent<HTMLInputElement>){
        const newFormData = Object.assign(this.state.formData,{
            [event.target.id]: event.target.value
        });
        const newState = Object.assign(this.state,{
            formData: newFormData
        });
        this.setState(newState);
    }

    private setErrorMessage(message:string){
        const newState = Object.assign(this.state,{
            message: message
        });
        this.setState(newState);
    }

    render(){
        return(
            <Container>
            <Col md = {{span:6, offset:3}}>
                <Card>
                    <Card.Body>
                        <Card.Title>
                            <FontAwesomeIcon icon = {faUserPlus} /> User Login
                        </Card.Title>
                            {(this.state.isRegistered === false) ? this.renderForm() : this.renderRegistrationCompleteMessage() }
                    </Card.Body>
                </Card>
            </Col>
        </Container>
        );
    }

    private renderForm(){
        return(
        <>
            <Form>
                
                <Row>
                    <Col md="6">
                        <Form.Group>
                            <Form.Label htmlFor="email">E-mail:</Form.Label>
                            <Form.Control type="email" id="email" value={this.state.formData.email} onChange={ event=> this.formInuptChange(event as any) }/>
                        </Form.Group>
                    </Col>

                    <Col md="6">
                        <Form.Group>
                            <Form.Label htmlFor="password">Password:</Form.Label>
                            <Form.Control type="password" id="password" value={this.state.formData.password} onChange={ event=> this.formInuptChange(event as any) }/>
                        </Form.Group>
                    </Col>
                </Row>
                
                <Row>
                    <Col md="6">
                        <Form.Group>
                            <Form.Label htmlFor="forename">Forname:</Form.Label>
                            <Form.Control type="text" id="forename" value={this.state.formData.forename} onChange={ event=> this.formInuptChange(event as any) }/>
                        </Form.Group>
                    </Col>
                    <Col md="6">
                        <Form.Group>
                            <Form.Label htmlFor="surname">Surname:</Form.Label>
                            <Form.Control type="text" id="surname" value={this.state.formData.surname} onChange={ event=> this.formInuptChange(event as any) }/>
                        </Form.Group>
                    </Col>
                </Row>
                <Form.Group>
                    <Form.Label htmlFor="phone">Phone:</Form.Label>
                    <Form.Control type="phone" id="phone" value={this.state.formData.phone} onChange={ event=> this.formInuptChange(event as any) }/>
                </Form.Group>
                <Form.Group>
                    <Form.Label htmlFor="address">Address:</Form.Label>
                    <Form.Control id="address" as="textarea" rows={4} value={this.state.formData.address} onChange={ event=> this.formInuptChange(event as any) }/>
                </Form.Group>
                <br/>
                <Form.Group>
                    <Button variant="primary" onClick={()=> this.doRegister()}> 
                        Register
                    </Button>
                </Form.Group>
            </Form>
            <Alert variant="danger" className={this.state.message ? '': 'd-none' }>
                {this.state.message}
            </Alert>
        </> 
        );

    }

    private renderRegistrationCompleteMessage(){
        return(
            <p>
                The account has been registered. <br/>
                <Link to="/user/login">Click here</Link> to go to the login page
            </p>
        )
    }

    private doRegister(){
        const data = {
            email: this.state.formData.email,
            password: this.state.formData.password,
            forename: this.state.formData.forename,
            surname: this.state.formData.surname,
            phoneNumber: this.state.formData.phone,
            postalAddress: this.state.formData.address
        }
        api('auth/user/register','post',data)
        .then((res:ApiResponse)=>{
            if(res.status === 'error'){
                this.setErrorMessage("System error... Try again!");
                return;
            }
            if(res.data.statusCode !== undefined){
                this.handleErrors(res.data);
                return;
            }
            this.registrationComplete();
        })
    }

    private handleErrors(data: any){
        let message = '';

        switch(data.statusCode){
            case -6001: message='This account already exists!'; break;
        }
        this.setErrorMessage(message);
    }

    private registrationComplete(){
        const newState = Object.assign(this.state,{
            isRegistered: true
        });
        this.setState(newState);
    }
}