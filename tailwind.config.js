/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      width: {
        fit: 'fit-content',
      },
      fontSize: {
        '2xs': '.65rem',
      },
      colors: {
        mainBlue: '#2E17F2',
        text1: '#14131D',
        text2: '#464366',
        text3: '#8E89C6',
        text4: '#A7A0E4',
        text5: '#C0BAF6',
        text6: '#504D72',
        purple2: '#C0BAF6',
        purple3: '#8780BF',
        purple4: '#685EC6',
        purple5: '#464366',
        bg1: '#191A24',
        bg2: '#2A2F42',
        bg3: '#3E4259',
        bg4: '#686E94',
        bg5: '#9096BE',
        bg6: '#171621',
        bg7: '#2D3040',
        bg8: '#191A24',
      },
      backgroundImage: {
        'example-dim':
          'linear-gradient(143.3deg,rgba(46,23,242,0.5) -185.11%,rgba(46,23,242,0) 49.63%),linear-gradient(113.18deg,#c0baf638 -0.1%,rgba(0,0,0,0) 98.9%),rgba(57,51,88,0.3)',
      },
    },
  },
  plugins: [],
}
