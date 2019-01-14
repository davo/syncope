/* jshint esnext: true */

const doc = document

doc.addEventListener('DOMContentLoaded', () => {
	WebFont.load({
		custom: { families: ['Graphik:n4', 'Graphik:n5'], urls: ['/css/graphik.css'] },
		loading: () => {
			capHeight.setContainer(document.body)
		},
		fontactive: capHeight.fontActive(properties => {
			console.log(properties)
		})
	})

	// capHeight.setContainer(document.body)

	// capHeight.calculate({})

	/**
	 * Main Syncope application.
	 */
	new Vue({
		el: '.app',
		data: {
			config: {
				baseFontSize: 16,
				baseLineHeight: 2,
				capHeight: 0.72,
				font: {
					current: 'Graphik',
					options: [{ value: 'Graphik', label: 'Graphik' }, { value: 'Roboto', label: 'Roboto' }],
					boldHeaders: false
				},
				scale: {
					current: 1.2,
					options: [
						{ value: 1.125, label: 'Custom (1.125)' },
						{ value: 1.2, label: 'Minor Third (1.2)' },
						{ value: 1.25, label: 'Major Third (1.25)' },
						{ value: 1.333, label: 'Fourth (1.333)' },
						{ value: 1.5, label: 'Fifth (1.5)' },
						{ value: 1.618, label: 'Fibonacci (1.618)' },
						{ value: 1.778, label: 'Minor Seventh (1.778)' },
						{ value: 1.875, label: 'Major Seventh (1.875)' },
						{ value: 2, label: 'Octave (2.0)' }
					],
					factors: {
						h1: 5,
						h2: 4,
						h3: 3,
						h4: 2,
						h5: 1,
						p: 0
					},
					headerSpacing: {
						before: 0,
						after: 0
					}
				},
				textWidth: 125 / 2,
				outputUnit: 'px',
				outputSyntax: 'css',
				outputVisible: true,
				showGrid: false
			},

			output: '',
			collapse: ['basic'],
			outputElement: doc.querySelector('.output code'),
			sandboxStylesSheetElement: doc.querySelector('.sandbox-styles')
		},

		watch: {
			config: {
				deep: true,
				handler: 'update'
			}
		},

		methods: {
			/**
			 * Updates the sandbox (preview) with the rhythm styles.
			 * General principal: multiplier ^ (step / interval)

			 */
			update() {
				const cfg = this.config
				const rhythms = {}

				cfg.rhythmUnit = Math.round(cfg.baseFontSize * cfg.baseLineHeight)

				for (let i in cfg.scale.factors) {
					rhythms[i] = new Rhythm(cfg.scale.factors[i], cfg)
				}

				this._setSandboxStyles(rhythms)
				this._setOutput(rhythms)
			},

			_setSandboxStyles(rhythms) {
				const cfg = this.config

				let styles = `.sandbox {
	font: ${cfg.baseFontSize}px/${cfg.baseLineHeight} ${cfg.font.current};
	padding: ${cfg.baseLineHeight}em;
	background: ${cfg.showGrid ? `linear-gradient(to bottom, rgba(123,195,255,.35 ) 1px, transparent 1px);` : 'transparent;'}
	max-width: ${cfg.textWidth}em;
	background-size: 100% ${cfg.rhythmUnit}px;
}`

				for (let i in rhythms) {
					styles += `.sandbox ${i} {${rhythms[i].print('css', 'px')}}\n\n`
				}

				styles += `.sandbox h1, .sandbox h2, .sandbox h3, .sandbox h4, .sandbox h5 {
	font-weight: ${cfg.font.boldHeaders ? 'bold' : 'normal'};
}`

				this.sandboxStylesSheetElement.innerHTML = styles
			},

			/**
			 * Updates the output area with the rhythm production styles.
			 *
			 * @param {Object.<Rhythm>} rhythms
			 */
			_setOutput(rhythms) {
				const cfg = this.config
				let code = `

html, body {
	font: ${cfg.baseFontSize}px/${cfg.baseLineHeight} '${cfg.font.current}';
}

`

				if (!cfg.font.boldHeaders) {
					code += `h1, h2, h3, h4 {
	font-weight: normal;
}

`
				}

				if (cfg.outputSyntax == 'css') {
					for (let r in rhythms) {
						code += `${r} {${rhythms[r].print(cfg.outputSyntax, cfg.outputUnit)}}\n\n`
					}
				} else {
					code += '$v-rhythm-levels: (\n'

					for (let r in rhythms) {
						code += `	${cfg.scale.factors[r]}: ( ${rhythms[r].print(cfg.outputSyntax, cfg.outputUnit)} ),\n`
					}

					code += ');\n'

					code += `
/**
 * Sets vertical–rhythm for the given level.
 * Usage:
 *
 * 	h1 {
 * 		@include v-rhythm( 4 );
 * 	}
 */
@mixin v-rhythm( $level ) {
	$rhythm: map-get( $v-rhythm-levels, $level );

	font-size: nth( $rhythm, 1 );
	line-height: nth( $rhythm, 2 );
	padding-top: nth( $rhythm, 3 );
	margin-bottom: nth( $rhythm, 4 );
}
`
				}

				this.output = hljs.highlight(cfg.outputSyntax, code).value
			}
		}
	}).update()
})
