import {Meteor} from 'meteor/meteor';
import {Activities} from '../activities.js';

Meteor.publish('activities', function () {
  return Activities.find({
    owner: this.userId
  }, {sort: {}});
});

Meteor.publish('activities.notLoggedIn', function () {
  return Activities.find({});
});

Meteor.publishTransformed('compoundActivities', function (projectId) {
  let query = {};
  projectId && (query._id = projectId);
  return Activities.find(query).serverTransform({
    'personResponsible': function (doc) {
      return Meteor.users.findOne({_id: doc.deliverer}, {
        fields: {
          services: 0, roles: 0
        }
      });
    },
    'ownerInfo': function (doc) {
      return Meteor.users.findOne({_id: doc.owner}, {
        fields: {
          services: 0, roles: 0
        }
      });
    },
  });
});

Meteor.publishTransformed('compoundActivitiesTemplates', function (templateId) {

  return Activities.find({
    templateId: templateId
  }).serverTransform({
    'personResponsible': function (doc) {
      return Meteor.users.findOne({_id: doc.owner}, {
        fields: {
          services: 0, roles: 0
        }
      });
    },
  });
});

Meteor.publish('activities.single', function (id) {
  return Activities.find({
    owner: this.userId,
    _id: id
  });
});