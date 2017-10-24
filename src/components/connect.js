/**
 * @flow
 */

import { is, omit, pick, equals, isEmpty } from 'ramda'
import { Component, createElement } from 'react'
import PropTypes from 'prop-types'
import { wrapDisplayName, shallowEqual } from 'recompose'
import styleEqual from 'style-equal'
import hoistStatics from 'hoist-non-react-statics'
import { shallowEqualArrays, isNotNil } from '@utils'
import flattenStyleSheets from '../utils/flatten-stylesheets'

import { StyleCreator } from '../types'

const DEFAULT_REF_NAME = 'wrappedInstance'

type Options = {
  withRef: boolean,
  refName: string,
  pure: boolean
}

type Props = {
  theme: string,
  children: any,
  styles?: Object,
  style?: any
}

type Context = {
  theme?: string,
  themes: Object,
  utils: Function,
  getTheme: (theme: string) => ?Object
}

// Helps track hot reloading.
let nextVersion = 0

const styled = (styles: StyleCreator, defaultProps = {}, options = {}) => {
  const {
    withRef = false,
    refName = DEFAULT_REF_NAME,
    pure = true
  }: Options = options

  const styleProps = styles.props || [] // ? concat(styles.props, utils.props) : utils.props
  const pickStyleProps = pick(styleProps)
  const createStyles = styles

  // Helps track hot reloading.
  const version = nextVersion++

  return (DecoratedComponent: ReactClass<any>): ReactClass<any> => {
    class DecoratorComponent extends Component {
      theme = null
      stylePropValues = null
      utilPropValues = null
      mergedProps = null
      styles = null
      utilStyles = null
      propStyles = null
      flattenedStyles = null
      renderedElement = null
      havePropsChanged = true
      version = version

      props: Props

      static defaultProps = defaultProps
      static DecoratedComponent = DecoratedComponent

      static contextTypes = {
        theme: PropTypes.string,
        themes: PropTypes.object,
        utils: PropTypes.func,
        getTheme: PropTypes.func,
      }

      static childContextTypes = {
        theme: PropTypes.string
      }

      getChildContext(): Object {
        return {
          theme: this.theme
        }
      }

      constructor(props: Props, context: Context) {
        super(props, context)

        this.theme = props.theme || context.theme || 'default'
        this.havePropsChanged = false
      }

      shouldComponentUpdate(): boolean {
        return !pure || this.havePropsChanged
      }

      componentWillReceiveProps(nextProps: Props) {
        const isChildrenArray = (
          is(Array, this.props.children) &&
          is(Array, nextProps.children)
        )

        if (
          isChildrenArray &&
          !shallowEqualArrays(this.props.children, nextProps.children)
        ) {
          this.havePropsChanged = true

          return
        }

        if (!isChildrenArray && (this.props.children !== nextProps.children)) {
          this.havePropsChanged = true

          return
        }

        if (
          !shallowEqual(
            omit(['style', 'styles', 'children'], nextProps),
            omit(['style', 'styles', 'children'], this.props)
          )
        ) {
          this.havePropsChanged = true

          return
        }

        if (
          nextProps.style &&
          this.props.style &&
          !styleEqual(nextProps.style, this.props.style)
        ) {
          this.havePropsChanged = true

          return
        }

        if (
          nextProps.styles &&
          this.props.styles &&
          !styleEqual(nextProps.styles, this.props.styles)
        ) {
          this.havePropsChanged = true
        }
      }

      componentWillUpdate(nextProps: Props, nextState: any, nextContext: Context) {
        if (process.env.NODE_ENV !== 'production') {
          this.clearCacheIfHotReloaded()
        }

        if (nextProps.theme !== this.theme && nextProps.theme) {
          this.theme = nextProps.theme

          return
        }

        if (!nextProps.theme && (nextContext.theme !== this.theme) && nextContext.theme) {
          this.theme = nextContext.theme
        }
      }

      componentWillUnmount() {
        this.clearCache()
      }

      parseStyles(props: Props) {
        this.styles = createStyles(
          props,
          this.theme
        )
      }

      parseUtils(props: Props) {
        this.utilStyles = this.context.utils(
          props,
          this.theme
        )
      }

      needsToUpdateStyles(stylePropValues: Object): boolean {
        if (isEmpty(stylePropValues) && this.styles) {
          return false
        }

        if (isNotNil(this.styles) && equals(this.stylePropValues, stylePropValues)) {
          return false
        }

        return true
      }

      needsToUpdateUtilStyles(utilPropValues: Object): boolean {
        if (isEmpty(utilPropValues)) {
          return false
        }

        if (isNotNil(this.utilStyles) && equals(this.utilPropValues, utilPropValues)) {
          return false
        }

        return true
      }

      updateStylesIfNeeded(): boolean {
        const stylePropValues = pickStyleProps(this.props)
        const utilPropValues = pick(this.context.utils.props, this.props)
        const propStyles = this.props.styles

        const needsToUpdateStyles = this.needsToUpdateStyles(stylePropValues)
        const needsToUpdateUtilStyles = this.needsToUpdateUtilStyles(utilPropValues)
        const needsToUpdatePropStyles = !equals(propStyles, this.propStyles)

        if (
          !needsToUpdateStyles &&
          !needsToUpdateUtilStyles &&
          !needsToUpdatePropStyles
        ) {
          return false
        }

        if (needsToUpdateStyles) {
          this.parseStyles(stylePropValues)
          this.stylePropValues = stylePropValues
        }

        if (needsToUpdateUtilStyles) {
          this.parseUtils(utilPropValues)
          this.utilPropValues = utilPropValues
        }

        if (needsToUpdatePropStyles) {
          this.propStyles = propStyles
        }

        this.flattenedStyles = flattenStyleSheets([
          this.styles,
          this.utilStyles,
          this.propStyles
        ])

        return true
      }

      updateMergedProps() {
        // eslint-disable-next-line no-unused-vars
        const { styles, ...rest } = this.props

        this.mergedProps = {
          styles: this.flattenedStyles,
          theme: this.theme,
          getColor: this.getColor,
          ...omit(this.context.utils.props, rest)
        }
      }

      getColor = (...args: Array<string>): ?string => {
        const theme = this.context.getTheme(this.theme)

        if (theme) {
          return theme.getColor(...args)
        }
      }

      // TODO: Remove this and add better support for hot reloading...
      clearCacheIfHotReloaded() {
        if (this.version === version) {
          return
        }

        // We are hot reloading!
        this.version = version
        this.clearCache()
      }

      clearCache() {
        this.stylePropValues = null
        this.utilPropValues = null
        this.mergedProps = null
        this.styles = null
        this.utilStyles = null
        this.propStyles = null
        this.flattenedStyles = null
        this.renderedElement = null
        this.havePropsChanged = true
      }

      render(): ReactElement<any> {
        const {
          havePropsChanged,
          renderedElement
        } = this

        this.havePropsChanged = false

        const haveStylesChanged = this.updateStylesIfNeeded()

        let haveMergedPropsChanged = true

        if (
          haveStylesChanged ||
          havePropsChanged
        ) {
          this.updateMergedProps()
        } else {
          haveMergedPropsChanged = false
        }

        if (!haveMergedPropsChanged && renderedElement) {
          return renderedElement
        }

        if (withRef) {
          this.renderedElement = createElement(DecoratedComponent, {
            ...this.mergedProps,
            ref: refName
          })
        } else {
          this.renderedElement = createElement(DecoratedComponent,
            this.mergedProps
          )
        }

        return this.renderedElement
      }
    }

    DecoratorComponent.displayName = wrapDisplayName(DecoratedComponent, 'Styled')

    return hoistStatics(DecoratorComponent, DecoratedComponent)
  }
}

export default styled
