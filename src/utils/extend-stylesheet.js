import { map } from 'ramda'
import assignDeep from 'assign-deep'
import { StyleSheet } from 'react-native'

const extendStyleSheet = (styleSheet, styles) => {
  const mergedStyles = assignDeep({}, map(
    StyleSheet.flatten,
    styleSheet
  ), styles)

  return StyleSheet.create(mergedStyles)
}

export default extendStyleSheet
