import { view, prop, is, lensProp, lensPath, map } from 'ramda'
import { StyleSheet } from 'react-native'
import invariant from 'invariant'
import createStylesParser from './utils/parse'
import combineStyles from './utils/combine-styles'

import type { Theme, Themes } from './types'

/**
 * component
 *
 * a wrapper on top of `StyleSheet.create` that adds the ability to use theme
 * variables.
 */

// component :: Object -> (__, theme) -> StyleSheet
export const component = parser => (styles: Object) => {
  invariant(is(Object, styles),
    'Styles passed to component must be an Object'
  )

  const parsedStyles = parser(styles)

  return (__, theme) => prop(theme, parsedStyles)
}

/**
 * modifier
 *
 * Used to create styles that alternates depending on a property value.
 *
 * Example:
 * ```
 * const size = modifier('size', {
 *   small: {
 *    title: {
 *      fontSize: 12
 *    }
 *   },
 *   medium: {
 *    title: {
 *      fontSize: 18
 *    }
 *   }
 * })
 *
 * ```
 */
export const modifier = (parser) => (name: string, styles: Object) => {
  invariant(is(Object, styles),
    'Styles passed to modifier must be an Object'
  )

  const modifierStyles = map(parser, styles)

  const getStyles = (props, theme) => view(
    lensPath([prop(name, props), theme]),
    modifierStyles
  )

  getStyles.props = [name]

  return getStyles
}

/**
 * boolModifier
 *
 * Similiar to `modifier` but only takes a single level style object that will
 * be returned if the named prop is true.
 */
export const boolModifier = (parser) => (name: string, styles: Object) => {
  invariant(is(Object, styles),
    'Styles passed to boolModifier must be an Object'
  )

  const modifierStyles = parser(styles)
  const getModifierProp = prop(name)

  const getStyles = (props, theme) => {
    const prop = getModifierProp(props)

    if (!prop) {
      return
    }

    return view(
      lensProp(theme),
      modifierStyles
    )
  }

  getStyles.props = [name]

  return getStyles
}

/**
 * util
 *
 * Used to create a reusable utility StyleSheet
 * Similiar to modifier but only acts on a single element.
 *
 * Example:
 * ```
 * const borderRadius = util('borderRadius', {
 *   small: {
 *     borderRadius: 3
 *   },
 *   medium: {
 *    borderRadius: 5
 *   },
 *   ...
 * })
 * ```
 */
export const util = (name: string, styles: Object) => {
  invariant(is(Object, styles),
    'Styles passed to util must be an Object'
  )

  const utilStyles = StyleSheet.create(styles)

  const getStyles = (props) => ({
    utils: utilStyles[props[name]]
  })

  getStyles.props = [name]

  return getStyles
}

const createStyleCreators = (themes: Themes) => {
  const parser = createStylesParser(themes)

  return {
    component: component(parser),
    modifier: modifier(parser),
    boolModifier: boolModifier(parser),
    util,
    combineStyles
  }
}

export default createStyleCreators
