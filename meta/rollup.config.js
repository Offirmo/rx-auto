//import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
	entry: 'dist/es2017/index.js',
	dest: 'dist/bundle.es2017.umd.js',
	format: 'umd',
	plugins: [
		nodeResolve({
			jsnext: true,
			main: true
		})
	]
}
