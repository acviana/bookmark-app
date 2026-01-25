import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
	// Ignore patterns
	{
		ignores: [
			'**/node_modules/**',
			'**/dist/**',
			'**/.wrangler/**',
			'**/worker-configuration.d.ts',
			'**/*.config.js',
			'**/*.config.ts',
			'**/*.config.mts',
		],
	},
	// Base config for all files
	js.configs.recommended,
	// TypeScript files
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 2021,
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				...globals.browser,
				...globals.es2021,
				...globals.node,
			},
		},
		plugins: {
			'@typescript-eslint': typescript,
			react: react,
			'react-hooks': reactHooks,
		},
		rules: {
			...typescript.configs.recommended.rules,
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off', // Using TypeScript for prop validation
			'@typescript-eslint/no-explicit-any': 'warn',
			'react-hooks/set-state-in-effect': 'off', // Allow setState in effects for data fetching
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
];
