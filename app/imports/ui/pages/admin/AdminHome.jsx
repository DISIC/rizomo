import Container from "@material-ui/core/Container"
import Fade from "@material-ui/core/Fade"
import Typography from "@material-ui/core/Typography"
import Paper from "@material-ui/core/Paper"
import { makeStyles} from "@material-ui/core/styles"
import React from "react"

const useStyles = makeStyles((theme) => ({
    root: {
      padding: theme.spacing(2),
      marginBottom: theme.spacing(5),
    }
  }));

export default function AdminHome() {
    const classes = useStyles()

    return (

        <Fade in>
          <Container style={{ overflowX: 'auto' }}>
          <Paper className={classes.root} >


                <Typography variant='h3'>{i18n.__('pages.AdminHome.title')}</Typography>
                <Typography variant='h6'>{i18n.__('pages.AdminHome.subtitle')}</Typography>
          </Paper>
          </Container>
          </Fade>
    )
}