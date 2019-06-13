import css from 'styled-jsx/css'

export const Button = (props) => (
  <button>
    { props.children }
    <style jsx>{`
      // stylus syntax
      body
        font: 14px/1.5 Helvetica, arial, sans-serif
        #logo
          border-radius: 5px

      // interpolation and support for comments
      vendor(prop, args)
        -webkit-{prop} args
        -moz-{prop} args
        {prop} args

      border-radius()
        vendor('border-radius', arguments)

    `}</style>
    <style jsx global>{`
      // variable support
      font-size = 14px
      body
        font font-size Arial, sans-serif

      //function support
      add(a, b)
        if a is a 'unit' and b is a 'unit'
          a + b
        else
          (error 'a and b must be units!')

      // media queries
      @media print
        #header
        #footer
          display none
    `}</style>
  </button>
)

// Scoped styles
export const button = css`button { color: hotpink; }`

// Global styles
export const body = css.global`body { margin: 0; }`

// Resolved styles
export const link = css.resolve`a { color: green; }`
