package com.movtour;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.mackentoch.beaconsandroid.BeaconsAndroidPackage;
import com.reactlibrary.RNBluetoothInfoPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.reactcommunity.rnlanguages.RNLanguagesPackage;
import com.rnfs.RNFSPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.github.wumke.RNExitApp.RNExitAppPackage;
import com.solinor.bluetoothstatus.RNBluetoothManagerPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.BV.LinearGradient.LinearGradientPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new BeaconsAndroidPackage(),
            new RNBluetoothInfoPackage(),
            new RNGestureHandlerPackage(),
            new MapsPackage(),
            new RNLanguagesPackage(),
            new RNFSPackage(),
            new ReactNativePushNotificationPackage(),
            new RNExitAppPackage(),
            new RNBluetoothManagerPackage(),
            new RNDeviceInfo(),
            new VectorIconsPackage(),
            new LinearGradientPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
