import { chain } from 'lodash';
import { element } from 'angular';
import moment from 'moment';
import uiModules from 'ui/modules';
import Notifier from 'ui/notify';
import { getNotificationClasses } from './lib/get_notification_classes';
import { StoredNotifications } from './lib/stored_notifications';
import template from './template.html';
import './index.less';

const module = uiModules.get('notification_center', []);

module.service('NotificationCenter', ($rootScope, $compile) => {
  const notifications = new StoredNotifications().load();
  return {
    notifications
  };
});

module.directive('notificationCenter', (config, NotificationCenter, $filter) => {
  return {
    restrict: 'E',
    template,
    scope: {
      notifs: '=list'
    },
    controller: ($scope) => {
      const notifs = $scope.notifs = NotificationCenter.notifications;
      $scope.$watchCollection(() => Notifier._notifs, change => {
        const timestamp = new Date().valueOf();
        const newNotifs = chain(change)
        .filter(notif => !notif.timestamp)
        .forEach(notif => notif.timestamp = timestamp)
        .value();
        if (newNotifs.length) {
          notifs.merge(...newNotifs);
        }
      });

      config.watch('dateFormat', setDateFormat, $scope);
      config.watch('dateFormat:tz', setDefaultTimezone, $scope);
      config.watch('dateFormat:dow', setStartDayOfWeek, $scope);

      function setDateFormat(format) {
        $scope.dateFormat = format;
      };

      function setDefaultTimezone(tz) {
        moment.tz.setDefault(tz);
      }

      function setStartDayOfWeek(day) {
        const dow = moment.weekdays().indexOf(day);
        moment.updateLocale(moment.locale(), { week: { dow } });
      }

      setDateFormat(config.get('dateFormat'));

      $scope.moment = moment;
      $scope.getNotificationClasses = getNotificationClasses;
    }
  };
});
