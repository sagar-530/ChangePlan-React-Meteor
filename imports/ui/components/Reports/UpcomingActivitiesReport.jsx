import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Grid from "@material-ui/core/Grid/Grid";
import {withRouter} from "react-router";
import {withSnackbar} from "notistack";
import {Paper, Table, TableBody, TableCell} from "@material-ui/core";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import moment from "moment";
import {getPhase, getTotalStakeholders} from "../../../utils/utils";
import AddActivities from "../Activities/Modals/AddActivities";
import {stringHelpers} from "../../../helpers/stringHelpers";

const useStyles = makeStyles(theme => ({
  root: {
    width: '100vw',
  },
  paper: {
    width: '90vw',
    marginBottom: theme.spacing(2),
  },
  table: {
    width: '100%',
  },
  tableCell: {
    border: '1px solid rgba(224, 224, 224, 1)',
    padding: '14px 30px 14px 30px',
  },
  dueDate: {
    border: '1px solid rgba(224, 224, 224, 1)',
    padding: '14px 30px 14px 30px',
    color: 'red',
  },
  tableHead: {
    border: '1px solid rgba(224, 224, 224, 1)',
    color: 'black',
    fontSize: '14px',
    letterSpacing: '0.001rem',
    whiteSpace: 'nowrap',
  },
  topHeading: {
    fontSize: '1.8rem',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '-0.015em',
    color: '#465563',
    marginLeft: 24,
    paddingTop: '10px',
  },
  gridTable: {
    padding: '10px 24px 20px 24px',
    overflowX: 'auto',
  },
}));

function UpcomingActivitiesReport(props) {
  const classes = useStyles();
  const {match, allActivities, allStakeholders, company, allImpacts, isSuperAdmin, isAdmin, isChangeManager, isManager,
    isActivityDeliverer, isActivityOwner, type} = props;
  const projectId = match.params.projectId;
  const [tableData, setTableData] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState({});
  const [step, setStep] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (allActivities) {
      let todayDate = new Date();
      let activities = [];
      if (type === 'upcoming') {
        const nextTwoWeeksDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() + 14);
        activities = allActivities.filter(activity => moment(moment(activity.dueDate).format()).isBetween(moment(todayDate).format(), moment(nextTwoWeeksDate).format()) && !activity.completed);
      } else if (type === 'overdue') {
        activities = allActivities.filter(activity => moment(activity.dueDate).isBefore(moment(todayDate)) && !activity.completed);
      }
      setTableData(activities);
    }
  }, [allStakeholders, allActivities, projectId]);

  const getImpacts = (activityId) => {
   const impacts = allImpacts.filter(impact => impact.activities.includes(activityId));
    return impacts.length || '-'
  };

  const editActivity = (activity) => {
    setSelectedActivity(activity);
    setShowModal(true);
    setStep(activity.step);
  };

  return (
    <Grid className={classes.root}>
      <Paper className={classes.paper}>
        <Grid container direction="row" justify="center" alignItems="center">
          <Grid item xs={12}>
            <Typography color="textSecondary" variant="h4" className={classes.topHeading}>
              {type === 'upcoming' ? 'Next two weeks activities' : 'Overdue Activities'}
            </Typography>
          </Grid>
          <Grid item xs={12} className={classes.gridTable}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell size="small" className={classes.tableHead} align="center">DUE DATE</TableCell>
                  <TableCell size="small" className={classes.tableHead} align="center">ACTIVITY TYPE</TableCell>
                  <TableCell size="small" className={classes.tableHead} align="center">DELIVERER</TableCell>
                  <TableCell size="small" className={classes.tableHead} align="center">CHANGE PHASE</TableCell>
                  <TableCell size="small" className={classes.tableHead} align="center">STAKEHOLDERS</TableCell>
                  <TableCell size="small" className={classes.tableHead} align="center">DESCRIPTION</TableCell>
                  <TableCell size="small" className={classes.tableHead} align="center">IMPACTS ADDRESSED</TableCell>
                  <TableCell size="small" className={classes.tableHead} align="center">TIME AWAY FROM BAU</TableCell>
                  <TableCell size="small" className={classes.tableHead} align="center">COST</TableCell>
                  <TableCell size="small" className={classes.tableHead} align="center">FEEDBACK?</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((activity, index) => {
                  return <TableRow key={index} onClick={() => editActivity(activity)}>
                    <TableCell className={type === 'overdue' ? classes.dueDate : classes.tableCell} align="center" padding="none"
                               key={index}>{moment(activity.dueDate).format('DD-MMM-YY')}</TableCell>
                    <TableCell size="small" className={classes.tableCell} align="center">{activity.name}</TableCell>
                    <TableCell size="small" className={classes.tableCell} align="center">
                      {activity.personResponsible ? `${activity.personResponsible.profile.firstName} ${activity.personResponsible.profile.lastName}` : ''}
                    </TableCell>
                    <TableCell size="small" className={classes.tableCell} align="center">{company && getPhase(activity.step, company)}</TableCell>
                    <TableCell size="small" className={classes.tableCell} align="center">{getTotalStakeholders(allStakeholders, activity.stakeHolders)}</TableCell>
                    <TableCell size="small" className={classes.tableCell} align="center">{stringHelpers.limitCharacters(activity.description, 50)}</TableCell>
                    <TableCell size="small" className={classes.tableCell} align="center">{getImpacts(activity._id)}</TableCell>
                    <TableCell size="small" className={classes.tableCell} align="center">{activity.time || '-'}</TableCell>
                    <TableCell size="small" className={classes.tableCell} align="center">{activity.cost !== 0 ? `$${activity.cost}` : '-'}</TableCell>
                    <TableCell size="small" className={classes.tableCell} align="center">{activity.stakeholdersFeedback ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                })}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
        <AddActivities edit={showModal} activity={selectedActivity} newActivity={() => setShowModal(false)} list={true} isOpen={false}
                       type={'project'} match={match} step={step} isSuperAdmin={isSuperAdmin} isAdmin={isAdmin} isManager={isManager}
                       isActivityDeliverer={isActivityDeliverer} isChangeManager={isChangeManager} isActivityOwner={isActivityOwner}/>
      </Paper>
    </Grid>
  )
}

export default withSnackbar(UpcomingActivitiesReport);
