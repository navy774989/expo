import { CodedError, NativeModulesProxy } from '@unimodules/core';
import { Platform, NativeModules } from 'react-native';
import { AppOwnership, ExecutionEnvironment, UserInterfaceIdiom, } from './Constants.types';
import ExponentConstants from './ExponentConstants';
export { AppOwnership, ExecutionEnvironment, UserInterfaceIdiom, };
if (!ExponentConstants) {
    console.warn("No native ExponentConstants module found, are you sure the expo-constants's module is linked properly?");
}
let manifest = null;
// If expo-updates defines a non-empty manifest, prefer that one
if (NativeModulesProxy.ExpoUpdates) {
    let updatesManifest;
    if (NativeModulesProxy.ExpoUpdates.manifest) {
        updatesManifest = NativeModulesProxy.ExpoUpdates.manifest;
    }
    else if (NativeModulesProxy.ExpoUpdates.manifestString) {
        updatesManifest = JSON.parse(NativeModulesProxy.ExpoUpdates.manifestString);
    }
    if (updatesManifest && Object.keys(updatesManifest).length > 0) {
        manifest = updatesManifest;
    }
}
// If dev-launcher defines a non-empty manifest, prefer that one
if (NativeModules.EXDevLauncher) {
    let devLauncherManifest;
    if (NativeModules.EXDevLauncher.manifestString) {
        devLauncherManifest = JSON.parse(NativeModules.EXDevLauncher.manifestString);
    }
    if (devLauncherManifest && Object.keys(devLauncherManifest).length > 0) {
        manifest = devLauncherManifest;
    }
}
// Fall back to ExponentConstants.manifest if we don't have one from Updates
if (!manifest && ExponentConstants && ExponentConstants.manifest) {
    manifest = ExponentConstants.manifest;
    // On Android we pass the manifest in JSON form so this step is necessary
    if (typeof manifest === 'string') {
        manifest = JSON.parse(manifest);
    }
}
const { name, appOwnership, ...nativeConstants } = (ExponentConstants || {});
const constants = {
    ...nativeConstants,
    // Ensure this is null in bare workflow
    appOwnership: appOwnership ?? null,
    // Legacy aliases
    deviceId: nativeConstants.installationId,
    linkingUrl: nativeConstants.linkingUri,
};
Object.defineProperties(constants, {
    manifest: {
        enumerable: true,
        get() {
            if (!manifest) {
                const invalidManifestType = manifest === null ? 'null' : 'undefined';
                if (nativeConstants.executionEnvironment === ExecutionEnvironment.Bare &&
                    Platform.OS !== 'web') {
                    console.warn(`Constants.manifest is ${invalidManifestType} because the embedded app.config could not be read. Ensure that you have installed the expo-constants build scripts if you need to read from Constants.manifest.`);
                }
                else if (nativeConstants.executionEnvironment === ExecutionEnvironment.StoreClient ||
                    nativeConstants.executionEnvironment === ExecutionEnvironment.Standalone) {
                    // If we somehow get here, this is a truly exceptional state to be in.
                    // Constants.manifest should *always* be defined in those contexts.
                    throw new CodedError('ERR_CONSTANTS_MANIFEST_UNAVAILABLE', `Constants.manifest is ${invalidManifestType}, must be an object.`);
                }
            }
            return manifest;
        },
        // This setter is only useful to mock the value for tests
        set(value) {
            manifest = value;
        },
    },
});
export default constants;
//# sourceMappingURL=Constants.js.map