/*
 * @todo
 *
 * should use hasOwnProperty or Object.getOwnPropertyDescriptors(). the latter usually makes code more readable, but sometimes the former first better
 * assignment and control structures/returns/etc should be separate by a blank line for readability.
 *      same for div and other block-level html elements
 * disable `no-console` b/c valid use case. if can make exception for `log` function without disabling, then do that. don't want console used for temporary debugging, but there are valid cases where you want to provide the user some insight into what went wrong
 */

module.exports = {
	extends : 'plugin:@wordpress/eslint-plugin/recommended',

	globals : {
		wp : true,
	},

	rules : {
		/*
		 * The rationale behind this rule is that sometimes a variable is defined by a costly operation, but then
		 * the variable is never used, so that operation was wasted. That's a valid point, but in practice that
		 * doesn't happen very often, so the benefit is not significant.
		 *
		 * The benefits of grouping variable assignments at the start of a function outweigh the costs, since it
		 * almost always makes the function easier to quickly grok.
		 *
		 * In the uncommon case where a significant performance penalty would be introduced, the developer is
		 * still free to choose to define the variable after the early returns.
		 */
		'@wordpress/no-unused-vars-before-return' : [ 'off' ],

		/*
		 * Instead of turning this off altogether, we should safelist the parameters that are coming in from
		 * the REST API. However, the `allow` config for this rule is only available in eslint 5+. Currently
		 * the @wordpress/scripts package uses eslint 4.x, but the next version will bump it up to 5.
		 *
		 * Here is the config to use once this is possible:
		 *
		 * 'camelcase' : [
		 *     'error',
		 *     {
		 *         allow: [ // These are variables defined in PHP and exposed via the REST API.
		 *             // Speakers block
		 *  		   'post_ids', 'term_ids', 'grid_columns',
		 *  		   'show_avatars', 'avatar_size', 'avatar_align',
		 *  		   'speaker_link', 'show_session',
		 *         ],
		 *     },
		 * ],
		 */
		'camelcase' : 'off',

		/*
		 * Short variable names are almost always obscure and non-descriptive, but they should be meaningful,
		 * obvious, and self-documenting.
		 */
		'id-length' : [ 'error', {
			'min'        : 3,
			'exceptions' : [ '__', '_n', '_x', 'id', 'a', 'b' ]
		} ],

		/*
		 * Force a line-length of 115 characters.
		 *
		 * We ignore URLs, trailing comments, strings, and template literals to prevent awkward fragmenting of
		 * meaningful content.
		 */
		'max-len': [ 'error', {
			'code'                   : 115,
			'ignoreUrls'             : true,
			'ignoreTrailingComments' : true,
			'ignoreStrings'          : true,
			'ignoreTemplateLiterals' : true,
		} ],

		/*
		 * Objects are harder to quickly scan when the formatting is inconsistent.
		 */
		'object-shorthand' : [ 'error', 'consistent-as-needed' ],

		/**
		 * Only prefer const over let when destructuring if all variables in the declaration are never reassigned.
		 *
		 * With the default setting of this rule, to prefer const when any of the destructured variables are never
		 * reassigned, we end up with situations where we have to destructure the same entity twice, which seems
		 * inefficient. E.g. if in the below example 'a' gets reassigned but 'b' doesn't:
		 *
		 * let { a, b } = var;
		 *
		 * Seems better than having to do:
		 *
		 * let { a } = var;
		 * const { b } = var;
		 */
		'prefer-const': [ 'error', {
			'destructuring': 'all',
		} ],

		/*
		 * A short description often makes a function easier to understand, and also provides a nice visual
		 * delineation between functions.
		 *
		 * Given that closures should be short and contextually relevant, requiring documentation for them would
		 * likely hurt readability more than it would help clarity.
		 */
		'require-jsdoc': [ 'error', {
			'require': {
				'FunctionDeclaration'     : true,
				'MethodDefinition'        : true,
				'ClassDeclaration'        : true,
				'ArrowFunctionExpression' : false,
				'FunctionExpression'      : true
			}
		} ],

		/*
		 * Descriptions are often obvious from the variable and function names, so always requiring them would be
		 * inconvenient. The developer should add one whenever it's not obvious, though.
		 *
		 * @todo `@param` tags should align the variable name and description, just like in PHP.
		 */
		'valid-jsdoc' : [ 'error', {
			'requireParamDescription'  : false,
			'requireReturnDescription' : false,
			'requireReturn'            : false,
		} ],
	},
};
