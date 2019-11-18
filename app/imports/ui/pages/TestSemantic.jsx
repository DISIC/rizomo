import React from "react";
import { Link } from "react-router-dom";
import { Accounts } from "meteor/accounts-base";
import i18n from "meteor/universe:i18n";
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

  /** Handle Signup submission. Create user account and a profile entry, then redirect to the home page. */
  submit = () => {
    const { email, password } = this.state;
    Accounts.createUser({ email, username: email, password }, err => {
      if (err) {
        this.setState({ error: err.reason });
      } else {
        this.setState({ error: "", redirectToReferer: true });
        this.setState({ email: "", password: "" });
      }
    });
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
              {i18n.__("pages.TestSemantic.registerAccount")}
            </Header>
            <Form onSubmit={this.submit}>
              <Segment stacked>
                <Form.Input
                  label={i18n.__("pages.TestSemantic.emailLabel")}
                  icon="user"
                  iconPosition="left"
                  name="email"
                  type="email"
                  placeholder={i18n.__("pages.TestSemantic.emailPlaceholder")}
                  onChange={this.handleChange}
                  value={this.state.email}
                />
                <Form.Input
                  label={i18n.__("pages.TestSemantic.passwdLabel")}
                  icon="lock"
                  iconPosition="left"
                  name="password"
                  placeholder={i18n.__("pages.TestSemantic.passwdPlaceholder")}
                  type="password"
                  onChange={this.handleChange}
                  value={this.state.password}
                />
                <Form.Button content={i18n.__("pages.TestSemantic.submit")} />
              </Segment>
            </Form>
            <Message>
              {i18n.__("pages.TestSemantic.returnSentence")}{" "}
              <Link to="/">{i18n.__("pages.TestSemantic.returnLink")}</Link>
            </Message>
            {this.state.error === "" ? (
              ""
            ) : (
              <Message
                error
                header={i18n.__("pages.TestSemantic.registerError")}
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
