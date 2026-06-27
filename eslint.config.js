import neostandard from 'neostandard'

export default [
    {
        ignores: [
            'dist/**',
            'public/**',
            'test/*.js',
            'docs/**',
            '**/lib.es5.d.ts'
        ]
    },
    ...neostandard({ ts: true }),
    {
        rules: {
            '@stylistic/operator-linebreak': ['off'],
            '@stylistic/multiline-ternary': 'off',
            '@stylistic/no-multiple-empty-lines': ['error', {
                max: 1,
                maxEOF: 1
            }],
            '@stylistic/indent': ['error', 4, {
                SwitchCase: 1,
                ignoredNodes: ['TemplateLiteral *']
            }],
            '@stylistic/comma-dangle': 'off',
            '@stylistic/no-multi-spaces': ['error', { ignoreEOLComments: true }],
            // Preserve the project's TS style (no space after colon in type
            // annotations; tight union types like `string|null`). neostandard's
            // TS-aware @stylistic rules would otherwise flag these.
            '@stylistic/key-spacing': 'off',
            '@stylistic/space-infix-ops': 'off'
        }
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/consistent-type-imports': ['error', {
                prefer: 'type-imports'
            }],
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_'
            }]
        }
    }
]
