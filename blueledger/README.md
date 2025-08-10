# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## M-Pesa SMS Listener

This feature allows the app to automatically track M-Pesa transactions by reading SMS messages.

### Limitations

*   **Android-only:** This feature is only available on Android devices. It will be disabled on other platforms.
*   **SMS Permission:** The app requires permission to read SMS messages. The user will be prompted to grant this permission.
*   **Message Format:** The feature relies on parsing the content of M-Pesa SMS messages. It has been designed to work with a variety of common M-Pesa message formats, but it may not be able to parse all messages correctly.

### Expected M-Pesa Message Formats

The SMS parser is designed to recognize the following patterns.

**Income:**
- `[CODE] Confirmed. You have received Ksh[AMOUNT] from [SENDER] on [DATE] at [TIME] New M-PESA balance is Ksh[BALANCE].`

**Expenses:**
- `[CODE] Confirmed. Ksh[AMOUNT] sent to [RECIPIENT] on [DATE] at [TIME]. New M-PESA balance is Ksh[BALANCE].`
- `[CODE] Confirmed. Ksh[AMOUNT] paid to [MERCHANT] for account [ACCOUNT] on [DATE] at [TIME]. New M-PESA balance is Ksh[BALANCE].`
- `[CODE] Confirmed. Ksh[AMOUNT] paid to [MERCHANT] on [DATE] at [TIME]. New M-PESA balance is Ksh[BALANCE].`
- `[CODE] Confirmed. Ksh[AMOUNT] airtime bought for [PHONE_NUMBER] on [DATE] at [TIME]. New M-PESA balance is Ksh[BALANCE].`
- `[CODE] Confirmed. Ksh[AMOUNT] withdrawn from agent [AGENT_ID] at [LOCATION] on [DATE] at [TIME]. New M-PESA balance is Ksh[BALANCE].`
