// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: train;

// MTA Train Widget added by Cody Hall
// Version 1.1

// Configuration
const widgetConfig = {
    defaultLocations: {
      timesSquare: { lat: 40.755356, lon: -73.987042, name: "Times Sq-42 St" },
    },
    colorMode: {
      auto: 0,
      light: 1,
      dark: 2
    },
    refreshInterval: 30, // seconds
    useSystemFont: true  // Set to false to use custom SF Pro font if available
  };
  
  // Font utilities
  const getFontSize = (family) => {
    const sizes = {
      small: { title: 13, train: 11, status: 9 },
      medium: { title: 17, train: 15, status: 11 },
      large: { title: 23, train: 17, status: 13 },
      extraLarge: { title: 28, train: 19, status: 15 }
    };
    return sizes[family] || sizes.medium;
  };
  
  const getSystemFont = (family) => {
    const size = getFontSize(family);
    return {
      title: Font.boldSystemFont(size.title),
      train: Font.systemFont(size.train, "monospaced"),
      status: Font.systemFont(size.status)
    };
  };
  
  // Temporarily set fonts; will be initialized in the MTAWidget constructor based on widget family
  let fonts = {};
  
  // Route colors with dark/light mode support
  const getRouteColors = (isDark) => ({
    A: Color.blue(),
    C: Color.blue(),
    E: Color.blue(),
    B: new Color("FD7023"),
    D: new Color("FD7023"),
    F: new Color("FD7023"),
    FX: new Color("FD7023"),
    M: new Color("FD7023"),
    N: new Color(isDark ? "fccc0a" : "EEAE00"),
    Q: new Color(isDark ? "fccc0a" : "EEAE00"),
    R: new Color(isDark ? "fccc0a" : "EEAE00"),
    W: new Color(isDark ? "fccc0a" : "EEAE00"),
    S: new Color("808183"),
    FS: new Color("808183"),
    H: new Color("808183"),
    L: new Color("a7a9ac"),
    1: new Color("ee352e"),
    2: new Color("ee352e"),
    3: new Color("ee352e"),
    4: new Color("00933c"),
    5: new Color("00933c"),
    6: new Color("00933c"),
    "6X": new Color("00933c"),
    7: new Color("b933ad"),
    "7X": new Color("b933ad"),
    J: new Color("996633"),
    Z: new Color("996633"),
    SI: Color.blue(),
    G: new Color("6cbe45")
  });
  
  // Time formatting
  const formatTime = (timeString) => {
    const now = new Date();
    const time = new Date(timeString);
    const minutesRemaining = Math.floor((time - now) / (60 * 1000));
    
    if (minutesRemaining === 0) return " NOW";
    if (minutesRemaining < 0) return `${minutesRemaining} min`;
    return minutesRemaining < 10 ? ` ${minutesRemaining} min` : `${minutesRemaining} min`;
  };
  
  class MTAWidget {
    constructor(family) {
      this.widget = new ListWidget();
      this.colorMode = widgetConfig.colorMode.auto;  // Changed to auto by default
      this.isDark = this.determineColorMode();
      this.widgetFamily = family;
      this.setupFonts();
      this.setupWidget();
    }
  
    setupFonts() {
      fonts = getSystemFont(this.widgetFamily);
    }
  
    determineColorMode() {
      if (this.colorMode === widgetConfig.colorMode.auto) {
        return Device.isUsingDarkAppearance();
      }
      return this.colorMode === widgetConfig.colorMode.dark;
    }
  
    setupWidget() {
      this.widget.backgroundColor = this.isDark ? 
        new Color("1C1C1E") : new Color("F2F2F7");
      this.widget.setPadding(12, 12, 12, 12);  // Reduced padding
      
      // Add blur effect for better visual
      this.widget.backgroundGradient = this.isDark ?
        this.createDarkGradient() : this.createLightGradient();
    }
  
    createDarkGradient() {
      const gradient = new LinearGradient();
      gradient.colors = [
        new Color("1C1C1E", 0.8),
        new Color("1C1C1E", 0.9)
      ];
      gradient.locations = [0.0, 1.0];
      return gradient;
    }
  
    createLightGradient() {
      const gradient = new LinearGradient();
      gradient.colors = [
        new Color("F2F2F7", 0.8),
        new Color("F2F2F7", 0.9)
      ];
      gradient.locations = [0.0, 1.0];
      return gradient;
    }
  
    async getCurrentLocation() {
      try {
        return await Location.current();
      } catch (error) {
        console.error('Failed to get current location, using default');
        return {
          latitude: widgetConfig.defaultLocations.timesSquare.lat,
          longitude: widgetConfig.defaultLocations.timesSquare.lon
        };
      }
    }
  
    async loadTrainData() {
      try {
        const location = await this.getCurrentLocation();
        const url = `https://api.wheresthefuckingtrain.com/by-location?lat=${location.latitude}&lon=${location.longitude}`;
        const request = new Request(url);
        const response = await request.loadJSON();
        
        if (!response.data?.[0]?.N || !response.data?.[0]?.S) {
          throw new Error('Incomplete train data available');
        }
        
        return response.data[0];
      } catch (error) {
        console.error(`Error loading train data: ${error.message}`);
        return null;
      }
    }
  
    async render() {
      const data = await this.loadTrainData();
      if (!data) {
        const errorText = this.widget.addText("Unable to load train data");
        errorText.font = fonts.title;
        return this.widget;
      }
  
      this.renderTitle(data.name);
      this.renderTrainList(data);
      this.renderUpdateTime();
  
      // Set refresh interval
      this.widget.refreshAfterDate = new Date(Date.now() + (widgetConfig.refreshInterval * 1000));
  
      return this.widget;
    }
  
    renderTitle(stationName) {
      const titleStack = this.widget.addStack();
      titleStack.layoutHorizontally();
      titleStack.centerAlignContent();
      titleStack.setPadding(0, 0, 0, 0); // Ensure no additional padding affects alignment
  
      // Add a spacer before the title to push it to the center
      titleStack.addSpacer()
  
      const title = titleStack.addText(stationName);
      title.font = fonts.title;
      title.textColor = this.isDark ? Color.white() : Color.black();
      title.centerAlignText();
  
      // Add location icon
      const locationIcon = titleStack.addText(" 📍");
      locationIcon.font = fonts.title;
  
      // Add a spacer after the icon to complete the centering
      titleStack.addSpacer();
    }
  
    renderTrainList(data) {
      const mainStack = this.widget.addStack();
      mainStack.layoutHorizontally();
      mainStack.centerAlignContent();
  
      // Add left spacer for equal spacing
      mainStack.addSpacer();
  
      // Left column - Uptown
      const leftStack = mainStack.addStack();
      leftStack.layoutVertically();
  
      const northLabel = leftStack.addText("Uptown ▲");
      northLabel.font = fonts.status;
      northLabel.textColor = Color.gray();
  
      this.createTrainStack(leftStack, data.N);
  
      // Add flexible spacer between columns
      mainStack.addSpacer();
  
      // Right column - Downtown
      const rightStack = mainStack.addStack();
      rightStack.layoutVertically();
  
      const southLabel = rightStack.addText("Downtown ▼");
      southLabel.font = fonts.status;
      southLabel.textColor = Color.gray();
  
      this.createTrainStack(rightStack, data.S);
  
      // Add right spacer for equal spacing
      mainStack.addSpacer();
    }
  
    createTrainStack(parentStack, trains) {
      if (!Array.isArray(trains)) {
        const noDataText = parentStack.addText("No trains available");
        noDataText.font = fonts.status;
        noDataText.textColor = Color.gray();
        return;
      }
  
      const displayCount = this.getDisplayCount();
      const routeColors = getRouteColors(this.isDark);
      
      const trainListStack = parentStack.addStack();
      trainListStack.layoutVertically();
      trainListStack.spacing = 2;  // Tighter spacing between trains
      
      trains.slice(0, displayCount).forEach(train => {
        const trainStack = trainListStack.addStack();
        trainStack.layoutHorizontally();
        trainStack.centerAlignContent();
        trainStack.spacing = 6;  // Reduced spacing between circle and time
        
        // Route circle with letter/number
        const routeCircle = trainStack.addStack();
        routeCircle.size = new Size(18, 18);  // Slightly smaller circles
        routeCircle.cornerRadius = 9;
        routeCircle.backgroundColor = routeColors[train.route];
        routeCircle.centerAlignContent();
        
        const routeText = routeCircle.addText(this.getRouteText(train.route));
        routeText.font = fonts.train;
        routeText.textColor = Color.white();
        routeText.centerAlignText();
        
        // Time
        const time = formatTime(train.time);
        const timeText = trainStack.addText(time);
        timeText.font = fonts.train;
        timeText.textColor = this.isDark ? Color.white() : Color.black();
      });
    }
  
    getRouteText(route) {
      const routeMap = {
        'H': 'SR',
        'FS': 'SF',
        'SI': 'SIR'
      };
      return routeMap[route] || route;
    }
  
    getDisplayCount() {
      const counts = {
        small: 5,
        medium: 5,
        large: 8,
        extraLarge: 10
      };
      return counts[this.widgetFamily] || counts.medium;
    }
  
    renderUpdateTime() {
      this.widget.addSpacer(2);  // Reduced spacing before update time
      const timeText = this.widget.addDate(new Date());
      timeText.applyRelativeStyle();
      timeText.textColor = Color.gray();
      timeText.font = fonts.status;
      timeText.centerAlignText();
      timeText.minimumScaleFactor = 0.5;
    }
  }
  
  // Initialize and run widget
  const widgetFamily = config.widgetFamily; // Get the current widget family from Scriptable
  const widgetInstance = new MTAWidget(widgetFamily);
  
  if (config.runsInWidget) {
    Script.setWidget(await widgetInstance.render());
  } else {
    await widgetInstance.render();
    if (Device.isPhone()) {
      widgetInstance.widget.presentLarge();
    } else {
      widgetInstance.widget.presentExtraLarge();
    }
  }
  
  Script.complete();