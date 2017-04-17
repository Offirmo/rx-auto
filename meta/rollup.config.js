import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
	entry: 'dist/es7/index.js',
	dest: 'dist/bundle.es7.cjs.js',
	format: 'umd',
	plugins: [
		nodeResolve({
			jsnext: true,
			main: true
		}),

		commonjs({
		})
	]
}
