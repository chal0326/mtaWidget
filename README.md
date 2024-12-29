# MTA Train Widget for iOS

A Scriptable widget that shows real-time MTA subway arrival times for the station closest to your current location.

## Features

- Shows upcoming train arrivals for both Uptown and Downtown directions
- Automatically finds the nearest subway station based on your location
- Displays train line indicators with official MTA colors
- Uses dark mode for consistent appearance
- Available in all iOS widget sizes (small, medium, large)
- Updates every 30 seconds

## Prerequisites

1. iOS device
2. [Scriptable app](https://apps.apple.com/us/app/scriptable/id1405459188) installed
    -Scriptable is an app that allows you to run scripts on your device using JavaScript. 
    -It allows you to create fully customizable widgets, extends the functionality of your device, and allows you to create your own scripts to automate your device.
3. Location Services enabled for Scriptable:
   - When prompted, select "While Using the App or Widgets" for location access
   - The prompt will explain: "Scriptable needs access to your location in order to use it in your scripts"
   - You can also enable this in Settings > Privacy > Location Services > Scriptable

## Installation

1. Download [Scriptable](https://apps.apple.com/us/app/scriptable/id1405459188) from the App Store
2. Open Scriptable
3. Tap the + button to create a new script
4. Copy the entire contents of `mtawidget.js` and paste it into the new script
5. Tap the name at the top and rename it to "MTA Widget"
6. Tap Done to save

## Adding to Home Screen

1. Long press on your home screen to enter edit mode
2. Tap the + button in the top left
3. Search for "Scriptable"
4. Choose your desired widget size
5. Add the widget to your home screen
6. Long press the widget and choose "Edit Widget"
7. Select "Script" and choose "MTA Widget"
8. The widget will now show train times for your nearest station

## Configuration

The widget includes some configurable options at the top of the script:

```javascript
const widgetConfig = {
  refreshInterval: 30,  // Update frequency in seconds
  useSystemFont: true,  // Use system font instead of custom font
  colorMode: {         // Widget appearance mode
    dark: 2            // Currently fixed to dark mode
  }
};
```

## Default Stations

If location services are unavailable, the widget will default to this stations:
- Times Square-42 St
You can change the default stations by editing the `defaultLocations` object in the script.

## Troubleshooting

1. **No Data Shows**: Make sure Location Services are enabled for Scriptable
2. **Wrong Station**: Check if you're near a different station than expected
3. **Widget Not Updating**: Ensure Background App Refresh is enabled for Scriptable

## Credits

- Train arrival data provided by [wheresthefuckingtrain.com](https://wheresthefuckingtrain.com)
- MTA official colors used for train line indicators 