// Event reminder hook using Notification API and localStorage

export function useEventReminder(eventId: string, eventTitle: string, startTime: string) {
  function requestAndSchedule() {
    if (!('Notification' in window)) return;

    Notification.requestPermission().then(permission => {
      if (permission !== 'granted') return;

      const key = `reminder_${eventId}`;
      const eventDate = new Date(startTime).getTime();
      const reminderTime = eventDate - 30 * 60 * 1000; // 30 min before
      const now = Date.now();

      if (reminderTime <= now) return; // event already passed or too close

      localStorage.setItem(key, String(reminderTime));

      const delay = reminderTime - now;
      setTimeout(() => {
        new Notification('CampusOS Event Reminder', {
          body: `"${eventTitle}" starts in 30 minutes!`,
          icon: '/favicon.ico',
        });
        localStorage.removeItem(key);
      }, delay);
    });
  }

  return { scheduleReminder: requestAndSchedule };
}
