import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Grid from "@material-ui/core/Grid/Grid";
import Typography from "@material-ui/core/Typography/Typography";
import {Meteor} from "meteor/meteor";
import {Activities} from "../../../../api/activities/activities";
import {withRouter} from "react-router";
import {withTracker} from "meteor/react-meteor-data";
import {Companies} from "../../../../api/companies/companies";
import {Peoples} from "../../../../api/peoples/peoples";
import {Projects} from "../../../../api/projects/projects";
import {withSnackbar} from "notistack";
import TimeAndActivitiesReport from '../../Reports/TimeAndActivitiesReport';
import AllUpcomingActivities from "./AllUpcomingActivities/AllUpcomingActivities";
import {Impacts} from "../../../../api/impacts/impacts";
import SideMenu from "../../App/SideMenu";
// import ChangeManagersReport from "./AdminReports/ChangeManagersReport";

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  activitiesGrid: {
    paddingRight: 20
  },
  activityTabs: {
    wrapper: {
      flexDirection: 'row',
    },
  },
  iconTab: {
    display: 'flex',
    alignItems: 'center'
  },
  activityTab: {
    border: '0.5px solid #c5c6c7',
    minWidth: 101,
    '&:selected': {
      backgroundColor: '#3f51b5',
      color: '#ffffff'
    }
  },
  searchContainer: {
    marginTop: 13,
    overflow: 'hidden'
  },
  topHeading: {
    fontSize: '1.8rem',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '-0.015em',
    color: '#465563',
    marginLeft: 24,
  },
  gridContainer: {
    overFlow: 'hidden'
  },
  topBar: {
    marginTop: 13,
  }
}));

function AdminReports(props) {
  let menus = [];
  let {company, allActivities, allStakeholders, allProjects, allImpacts, allUsers} = props;
  const classes = useStyles();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChangeManager, setIsChangeManager] = useState(false);
  const [currentStakeholders, setCurrentStakeholders] = useState([]);

  useEffect(() => {
    checkRoles();
  }, [company]);

  const checkRoles = () => {
    const userId = Meteor.userId();
    if (Roles.userIsInRole(userId, 'superAdmin')) {
      setIsSuperAdmin(true);
    }

    if (company && company.admins && company.admins.includes(userId)) {
      setIsAdmin(true);
    }

    if (company) {
      const projectsCurCompany = Projects.find({companyId: company._id}).fetch();
      if (projectsCurCompany) {
        const changeManagers = [...new Set([].concat.apply([], projectsCurCompany.map(project => project.changeManagers)))];
        if (!Roles.userIsInRole(userId, 'superAdmin') && changeManagers.includes(userId)) {
          setIsChangeManager(true);
        }
      }
    }
  };

  useEffect(() => {
    let stakeholders = [];
    if (isAdmin) {
      stakeholders = allStakeholders.filter(stakeholder => stakeholder.company === company._id);
    }
    if (isChangeManager && !isAdmin) {
      const projects = allProjects.filter(project => project.changeManagers.includes(Meteor.userId()));
      const projectStakeholders = [];
      projects.forEach(project => {
        projectStakeholders.push(...project.stakeHolders)
      });
      stakeholders = allStakeholders.filter(stakeholder => projectStakeholders.includes(stakeholder._id));
    }
    setCurrentStakeholders(stakeholders)
  }, [isAdmin, isChangeManager, allStakeholders]);

  return (
    <div className={classes.root}>
      <SideMenu {...props} />
      <main className={classes.content}>
        <div className={classes.toolbar}/>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
          className={classes.gridContainer}
          spacing={0}
        >
          <Grid
            container
            className={classes.topBar}
            direction="row"
            justify="space-between"
          >
            <Grid item xs={3} md={7}>
              <Typography color="textSecondary" variant="h4" className={classes.topHeading}>
                Reports
              </Typography>
            </Grid>
          </Grid>
          <Grid container direction="row" justify="space-between">
            <TimeAndActivitiesReport match={props.match} allStakeholders={currentStakeholders}
                                     allActivities={allActivities} type={"time"}/>
          </Grid>
          <Grid container direction="row" justify="space-between">
            <TimeAndActivitiesReport match={props.match} allStakeholders={currentStakeholders}
                                     allActivities={allActivities} type={"activities"}/>
          </Grid>
          <Grid container direction="row" justify="space-between">
            <AllUpcomingActivities match={props.match} allActivities={allActivities} allProjects={allProjects}
                                   type={'upcoming'}
                                   company={company} isAdmin={isAdmin} isChangeManager={isChangeManager}
                                   allStakeholders={allStakeholders}/>
          </Grid>
          <Grid container direction="row" justify="space-between">
            <AllUpcomingActivities match={props.match} allActivities={allActivities} allProjects={allProjects}
                                   type={'overdue'}
                                   company={company} isAdmin={isAdmin} isChangeManager={isChangeManager}
                                   allStakeholders={allStakeholders}/>
          </Grid>
        </Grid>
        {/*   <Grid container direction="row" justify="space-between">
        <ChangeManagersReport match={props.match} allUsers={allUsers} allProjects={allProjects} company={company}
                                 allActivities={allActivities}/>
      </Grid>*/}
      </main>
    </div>
  )
}

const AdminReportsPage = withTracker(props => {
  const userId = Meteor.userId();
  Meteor.subscribe('compoundActivities');
  Meteor.subscribe('findAllPeoples');
  Meteor.subscribe('compoundProject');
  Meteor.subscribe('companies');
  Meteor.subscribe('impacts.findAll');
  return {
    company: Companies.findOne({peoples: userId}),
    allActivities: Activities.find({}).fetch(),
    allStakeholders: Peoples.find({}).fetch(),
    allProjects: Projects.find({}).fetch(),
    allImpacts: Impacts.find({}).fetch(),
    allUsers: Meteor.users.find({}).fetch(),
  }
})(withRouter(AdminReports));

export default withSnackbar(AdminReportsPage);
