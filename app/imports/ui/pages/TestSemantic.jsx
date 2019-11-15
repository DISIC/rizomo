import React from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Form,
  Grid,
  Header,
  Message,
  Segment
} from "semantic-ui-react";
import "semantic-ui-css/semantic.css";

/**
 * Signup component is similar to signin component, but we create a new user instead.
 */
class TestSemantic extends React.Component {
  /** Initialize state fields. */
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      error: "",
      redirectToReferer: false
    };
  }

  /** Update the form controls each time the user interacts with them. */
  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value });
  };

  /** Display the signup form. Redirect to add page after successful registration and login. */
  render() {
    return (
      <Container>
        <h1>
          <a href="https://react.semantic-ui.com/">Semantic UI React</a>
        </h1>
        <Grid textAlign="center" verticalAlign="middle" centered columns={2}>
          <Grid.Column>
            <Header as="h2" textAlign="center">
              Register your account
            </Header>
            <Form>
              <Segment stacked>
                <Form.Input
                  label="Email"
                  icon="user"
                  iconPosition="left"
                  name="email"
                  type="email"
                  placeholder="E-mail address"
                  onChange={this.handleChange}
                />
                <Form.Input
                  label="Password"
                  icon="lock"
                  iconPosition="left"
                  name="password"
                  placeholder="Password"
                  type="password"
                  onChange={this.handleChange}
                />
                <Form.Button content="Submit" />
              </Segment>
            </Form>
            <Message>
              Already have an account? Return <Link to="/">here</Link>
            </Message>
            {this.state.error === "" ? (
              ""
            ) : (
              <Message
                error
                header="Registration was not successful"
                content={this.state.error}
              />
            )}
          </Grid.Column>
        </Grid>
      </Container>
    );
  }
}

export default TestSemantic;
