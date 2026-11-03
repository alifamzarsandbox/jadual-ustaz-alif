export async function showSystemReminder(
  enabled: boolean,
  title: string,
  options: NotificationOptions,
  api: typeof Notification | undefined,
  getRegistration: () => Promise<Pick<ServiceWorkerRegistration, "showNotification"> | undefined>,
) {
  if (!enabled || api?.permission !== "granted") return;
  try {
    const registration = await getRegistration();
    if (registration) await registration.showNotification(title, options);
    else new api(title, options);
  } catch {
    // The in-app toast has already been shown, even when OS delivery fails.
  }
}
