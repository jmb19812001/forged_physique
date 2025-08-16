const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.resolverMainFields = ['native', 'browser', 'main'];

module.exports = defaultConfig;