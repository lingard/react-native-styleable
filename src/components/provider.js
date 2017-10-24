/**
 * @flow
 */

import { PureComponent, Children } from 'react'
import PropTypes from 'prop-types'

type Theme = {
  getColor: (component: string, name: string) => ?string
}

type Props = {
  defaultTheme: string,
  themes: {
    [name: string]: Theme
  },
  utils: (props: Object) => ?Object,
  children: Object
}

type ChildContextTypes = {
  theme: string,
  themes: {
    [name: string]: Theme
  },
  utils: (props: Object) => ?Object,
  getTheme: (name: string) => ?Theme
}

class ThemeProvider extends PureComponent {
  props: Props

  static childContextTypes: ChildContextTypes = {
    theme: PropTypes.string.isRequired,
    themes: PropTypes.object.isRequired,
    utils: PropTypes.func,
    getTheme: PropTypes.func.isRequired
  }

  static defaultProps = {
    defaultTheme: 'default',
    utils: {}
  }

  getChildContext(): ChildContextTypes {
    return {
      theme: this.props.defaultTheme,
      themes: this.props.themes,
      utils: this.props.utils,
      getTheme: this.getTheme
    }
  }

  getTheme = (theme: string): ?Theme =>
    this.props.themes[theme]

  render(): ?React.Element<any> {
    const { children } = this.props

    return Children.only(children)
  }
}

export default ThemeProvider
