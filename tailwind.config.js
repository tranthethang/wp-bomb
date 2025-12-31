module.exports = {
	darkMode: 'class',
	content: ['./app/**/*.php', './assets/**/*.js'],
	theme: {
		extend: {
			colors: {
				'wp-primary': 'var(--wp-primary)',
				'wp-primary-hover': 'var(--wp-primary-hover)',
				'wp-success': 'var(--wp-success)',
				'wp-error': 'var(--wp-error)',
				'wp-warning': 'var(--wp-warning)',
				'wp-text': 'var(--wp-text)',
				'wp-sub': 'var(--wp-sub)',
				'wp-border': 'var(--wp-border)',
				'wp-surface': 'var(--wp-surface)',
			},
			fontFamily: {
				body: [
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI',
					'Roboto',
					'sans-serif',
				],
			},
			borderRadius: {
				DEFAULT: '3px',
				sm: '3px',
			},
			boxShadow: {
				'wp-card': '0 1px 1px rgba(0, 0, 0, 0.04)',
			},
		},
	},
	plugins: [],
};
