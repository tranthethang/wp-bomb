const { useState, useEffect, useRef, useCallback, useMemo } = wp.element;
const { render } = wp.element;
const apiFetch = wp.apiFetch;
const e = wp.element.createElement;

const SettingsView = ({ settings, onSettingsChange, onStart, availableSizes, isLoadingSizes }) => {
	const handleBatchSizeChange = (e) => {
		onSettingsChange({ batchSize: parseInt(e.target.value) || 1 });
	};

	const handleSizeToggle = (size) => {
		const newSelected = settings.selectedSizes.includes(size)
			? settings.selectedSizes.filter(s => s !== size)
			: [...settings.selectedSizes, size];
		onSettingsChange({ selectedSizes: newSelected });
	};

	const handleSkipExistingToggle = () => {
		onSettingsChange({ skipExisting: !settings.skipExisting });
	};

	return e('div', { className: 'bg-white border border-wp-border shadow-wp-card rounded-none sm:rounded-[3px] overflow-hidden' },
		e('form', { className: 'p-0', onSubmit: (e) => { e.preventDefault(); onStart(); } },
			e('div', { className: 'divide-y divide-gray-100' },
				// Batch Size Section
				e('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6 p-6 items-start' },
					e('div', { className: 'md:col-span-1' },
						e('label', { className: 'text-sm font-semibold text-wp-heading', htmlFor: 'batch_size' }, 'Images per Batch'),
						e('p', { className: 'text-xs text-gray-500 mt-1 leading-relaxed' }, 'The number of images processed in a single AJAX request.')
					),
					e('div', { className: 'md:col-span-2' },
						e('div', { className: 'flex items-center gap-4 max-w-md' },
							e('input', {
								className: 'w-20 text-center font-medium border-gray-300 rounded-[3px] text-[14px] py-1.5 px-3 focus:border-wp-primary focus:ring-1 focus:ring-wp-primary shadow-sm',
								id: 'batch_size',
								type: 'number',
								min: 1,
								max: 50,
								value: settings.batchSize,
								onChange: handleBatchSizeChange
							}),
							e('div', { className: 'flex-grow' },
								e('input', {
									className: 'w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-wp-primary',
									id: 'batch_slider',
									type: 'range',
									min: 1,
									max: 50,
									value: settings.batchSize,
									onChange: handleBatchSizeChange
								})
							)
						),
						e('p', { className: 'mt-2 text-xs text-gray-500 italic flex items-center gap-1' },
							e('span', { className: 'material-symbols-outlined text-[16px] text-gray-400' }, 'info'),
							' Low (5-10) for shared hosting, High (20+) for dedicated servers.'
						)
					)
				),
				// Thumbnail Sizes Section
				e('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6 p-6 items-start' },
					e('div', { className: 'md:col-span-1' },
						e('label', { className: 'text-sm font-semibold text-wp-heading' }, 'Target Thumbnail Sizes'),
						e('p', { className: 'text-xs text-gray-500 mt-1 leading-relaxed' }, 'Select specific sizes to regenerate to save time and resources.')
					),
					e('div', { className: 'md:col-span-2 space-y-3' },
						isLoadingSizes ? e('p', { className: 'text-sm text-gray-400 italic' }, 'Loading registered sizes...') :
						Object.entries(availableSizes).map(([size, label]) => {
							const checkboxId = `wp-bomb-size-${size}`;
							return e('label', { key: size, htmlFor: checkboxId, className: 'flex items-start cursor-pointer group' },
								e('input', {
									id: checkboxId,
									type: 'checkbox',
									checked: settings.selectedSizes.includes(size),
									onChange: () => handleSizeToggle(size),
									style: { marginRight: '8px', marginTop: '2px', cursor: 'pointer' }
								}),
								e('span', { className: 'text-[13px] text-wp-text group-hover:text-wp-heading' }, label),
								e('div', { className: 'flex-grow pointer-events-none' })
							);
						})
					)
				),
				// Advanced Options Section
				e('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6 p-6 items-start' },
					e('div', { className: 'md:col-span-1' },
						e('label', { className: 'text-sm font-semibold text-wp-heading' }, 'Advanced Options')
					),
					e('div', { className: 'md:col-span-2' },
						(() => {
							const skipExistingId = 'wp-bomb-skip-existing';
							return e('label', { htmlFor: skipExistingId, className: 'flex items-start cursor-pointer group' },
								e('input', {
									id: skipExistingId,
									type: 'checkbox',
									checked: settings.skipExisting,
									onChange: handleSkipExistingToggle,
									style: { marginRight: '8px', marginTop: '2px', cursor: 'pointer', flexShrink: 0 }
								}),
								e('div', { className: 'text-[13px]' },
									e('span', { className: 'block text-wp-text font-medium group-hover:text-wp-heading' }, 'Skip existing correctly sized thumbnails'),
									e('span', { className: 'block text-gray-500 text-xs mt-0.5' }, 'Only regenerate if the file is missing or dimensions are incorrect.')
								),
								e('div', { className: 'flex-grow pointer-events-none' })
							);
						})()
					)
				)
			),
			e('div', { className: 'bg-gray-50 border-t border-wp-border px-6 py-4 flex items-center justify-end' },
				e('button', {
					type: 'submit',
					className: 'bg-wp-primary text-white text-[13px] font-medium border border-wp-primary rounded-[3px] px-4 py-2 cursor-pointer transition ease-in-out duration-150 hover:bg-wp-primary-hover hover:border-wp-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wp-primary'
				}, 'Start Regenerating Thumbnails')
			)
		)
	);
};

const ProgressView = ({ stats, status, lastProcessed, onStop, onStartOver, onReturn }) => {
	const isCompleted = status === 'completed';
	const isStopped = status === 'stopped';
	const isRunning = status === 'processing';

	return e('div', { className: 'bg-wp-surface border border-wp-border shadow-wp-card sm:rounded-sm' },
		// Progress Header
		e('div', { className: 'px-4 py-4 sm:px-6 border-b border-wp-border flex justify-between items-center bg-white' },
			e('h3', { className: 'text-sm font-semibold text-gray-900' }, 'Progress'),
			e('span', {
				className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
					isCompleted ? 'bg-green-100 text-green-800' :
					isRunning ? 'bg-blue-100 text-blue-800' :
					'bg-gray-100 text-gray-800'
				}`
			}, status.charAt(0).toUpperCase() + status.slice(1))
		),
		e('div', { className: 'p-4 sm:p-6 space-y-6' },
			// Progress Bar Area
			e('div', { className: 'space-y-2' },
				e('div', { className: 'flex justify-between text-sm text-wp-sub mb-1' },
					e('span', null, 'Processing image ', e('strong', { className: 'text-gray-800' }, stats.processed), ' of ', e('strong', { className: 'text-gray-800' }, stats.total)),
					e('span', { className: 'font-medium text-gray-800' }, `${stats.percentage}%`)
				),
				e('div', { className: 'w-full bg-gray-200 rounded-sm h-5 overflow-hidden shadow-inner border border-gray-300 relative' },
					e('div', {
						className: 'bg-wp-primary h-full transition-all duration-300 ease-out flex items-center justify-end relative overflow-hidden',
						style: { width: `${stats.percentage}%` }
					},
						isRunning && e('div', { className: 'absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress-bar-stripes_1s_linear_infinite]' })
					)
				),
				e('p', { className: 'text-xs text-wp-sub italic mt-1' }, 'Last processed: ', e('span', { className: 'text-gray-600' }, lastProcessed || 'Waiting...'))
			),
			// Stats Grid
			e('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4 py-2' },
				e('div', { className: 'flex flex-col border-l-4 border-wp-success bg-white pl-4 py-1' },
					e('span', { className: 'text-xs font-medium text-wp-sub uppercase tracking-wide' }, 'Completed'),
					e('div', { className: 'flex items-baseline mt-1' },
						e('span', { className: 'text-2xl font-semibold text-gray-900' }, stats.completed),
						e('span', { className: 'ml-2 text-sm text-gray-500' }, 'items')
					)
				),
				e('div', { className: 'flex flex-col border-l-4 border-wp-error bg-white pl-4 py-1' },
					e('span', { className: 'text-xs font-medium text-wp-sub uppercase tracking-wide' }, 'Failed'),
					e('div', { className: 'flex items-baseline mt-1' },
						e('span', { className: 'text-2xl font-semibold text-gray-900' }, stats.failed),
						e('span', { className: 'ml-2 text-sm text-gray-500' }, 'items')
					)
				),
				e('div', { className: 'flex flex-col border-l-4 border-wp-warning bg-white pl-4 py-1' },
					e('span', { className: 'text-xs font-medium text-wp-sub uppercase tracking-wide' }, 'Pending'),
					e('div', { className: 'flex items-baseline mt-1' },
						e('span', { className: 'text-2xl font-semibold text-gray-900' }, stats.pending),
						e('span', { className: 'ml-2 text-sm text-gray-500' }, 'items')
					)
				)
			),
			// Success Message
			isCompleted && e('div', { className: 'bg-white border-l-4 border-wp-success p-4 shadow-sm' },
				e('div', { className: 'flex' },
					e('div', { className: 'flex-shrink-0' },
						e('span', { className: 'material-symbols-outlined text-wp-success text-xl' }, 'check_circle')
					),
					e('div', { className: 'ml-3' },
						e('p', { className: 'text-sm font-medium text-gray-900' }, 'All done!'),
						e('div', { className: 'mt-1 text-sm text-wp-sub' },
							e('p', null, `Successfully regenerated thumbnails for ${stats.completed} images in ${stats.duration} seconds.`)
						)
					)
				)
			),
			// Actions
			e('div', { className: 'pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3' },
				isCompleted && e('button', {
					onClick: onReturn,
					className: 'inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded transition duration-150 ease-in-out border bg-wp-primary text-white border-wp-primary hover:bg-wp-primary-hover hover:border-wp-primary-hover'
				}, 'Return to Media Library'),
				(isCompleted || isStopped) && e('button', {
					onClick: onStartOver,
					className: 'inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded transition duration-150 ease-in-out border bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:text-gray-800'
				}, 'Start Over'),
				e('div', { className: 'flex-grow' }),
				isRunning && e('button', {
					onClick: onStop,
					className: 'text-red-600 hover:text-red-700 hover:bg-red-50 border-transparent text-sm font-medium px-3 py-1.5 rounded transition duration-150 ease-in-out'
				}, 'Stop Process')
			)
		)
	);
};

const RegenerateThumbnailsApp = () => {
	const [view, setView] = useState('settings');
	const [status, setStatus] = useState('idle');
	const [settings, setSettings] = useState({
		batchSize: wpBombData.batch_size || 10,
		selectedSizes: [],
		skipExisting: false
	});
	const [availableSizes, setAvailableSizes] = useState({});
	const [isLoadingSizes, setIsLoadingSizes] = useState(true);
	
	const [stats, setStats] = useState({
		total: 0,
		processed: 0,
		completed: 0,
		failed: 0,
		pending: 0,
		percentage: 0,
		startTime: null,
		duration: 0
	});
	
	const [lastProcessed, setLastProcessed] = useState('');
	const [attachmentIds, setAttachmentIds] = useState([]);
	const isMountedRef = useRef(true);
	const shouldStopRef = useRef(false);

	useEffect(() => {
		fetchSizes();
		return () => { isMountedRef.current = false; };
	}, []);

	const fetchSizes = async () => {
		try {
			const response = await apiFetch({ path: '/wpbomb/v1/regenerate-thumbnails/sizes' });
			if (isMountedRef.current && response.success) {
				setAvailableSizes(response.sizes);
				setSettings(prev => ({
					...prev,
					selectedSizes: Object.keys(response.sizes)
				}));
				setIsLoadingSizes(false);
			}
		} catch (error) {
			console.error('Failed to fetch sizes', error);
		}
	};

	const handleStart = async () => {
		shouldStopRef.current = false;
		setStatus('loading');
		setView('progress');
		
		try {
			const response = await apiFetch({ path: '/wpbomb/v1/regenerate-thumbnails/attachments' });
			if (!isMountedRef.current) return;
			
			if (response.success) {
				const ids = response.attachment_ids;
				setAttachmentIds(ids);
				setStats({
					total: response.total,
					processed: 0,
					completed: 0,
					failed: 0,
					pending: response.total,
					percentage: 0,
					startTime: Date.now(),
					duration: 0
				});
				setStatus('processing');
				processBatches(ids, 0, { completed: 0, failed: 0 });
			}
		} catch (error) {
			console.error('Failed to start process', error);
			setStatus('error');
		}
	};

	const processBatches = async (allIds, currentIndex, currentStats) => {
		if (!isMountedRef.current || shouldStopRef.current) {
			if (shouldStopRef.current) setStatus('stopped');
			return;
		}

		if (currentIndex >= allIds.length) {
			const endTime = Date.now();
			const duration = Math.round((endTime - stats.startTime) / 1000);
			setStats(prev => ({ ...prev, duration, pending: 0, percentage: 100 }));
			setStatus('completed');
			return;
		}

		const batchIds = allIds.slice(currentIndex, currentIndex + settings.batchSize);
		
		try {
			const response = await apiFetch({
				path: '/wpbomb/v1/regenerate-thumbnails/batch-process',
				method: 'POST',
				data: {
					attachment_ids: batchIds,
					selected_sizes: settings.selectedSizes,
					skip_existing: settings.skipExisting
				}
			});

			if (!isMountedRef.current || shouldStopRef.current) {
				if (shouldStopRef.current) setStatus('stopped');
				return;
			}

			const results = response.results || {};
			let newCompleted = currentStats.completed;
			let newFailed = currentStats.failed;
			let lastFile = '';

			Object.values(results).forEach(res => {
				if (res.success) {
					newCompleted++;
					lastFile = res.filename;
				} else {
					newFailed++;
				}
			});

			const processed = currentIndex + batchIds.length;
			const percentage = Math.round((processed / allIds.length) * 100);
			
			setStats(prev => ({
				...prev,
				processed,
				completed: newCompleted,
				failed: newFailed,
				pending: allIds.length - processed,
				percentage
			}));
			
			if (lastFile) setLastProcessed(lastFile);

			// Small delay to allow UI updates
			await new Promise(resolve => setTimeout(resolve, 50));
			
			processBatches(allIds, processed, { completed: newCompleted, failed: newFailed });
		} catch (error) {
			console.error('Batch failed', error);
			setStatus('error');
		}
	};

	const handleStop = () => {
		shouldStopRef.current = true;
	};

	const handleStartOver = () => {
		setView('settings');
		setStatus('idle');
		setStats({
			total: 0, processed: 0, completed: 0, failed: 0, pending: 0, percentage: 0, startTime: null, duration: 0
		});
		setLastProcessed('');
	};

	return e('div', { className: '' },
		e('div', { className: 'mb-6' },
			e('h1', { className: 'text-2xl font-medium text-gray-800 mb-2' }, 'Regenerate Thumbnails'),
			e('p', { className: 'text-[13px] text-wp-sub leading-relaxed max-w-4xl' },
				'This tool regenerates thumbnails for all image attachments. This is useful if you have changed your theme or one of your thumbnail dimensions.'
			)
		),
		view === 'settings' ? e(SettingsView, {
			settings,
			availableSizes,
			isLoadingSizes,
			onSettingsChange: (newSettings) => setSettings(prev => ({ ...prev, ...newSettings })),
			onStart: handleStart
		}) : e(ProgressView, {
			stats,
			status,
			lastProcessed,
			onStop: handleStop,
			onStartOver: handleStartOver,
			onReturn: () => window.location.href = wpBombData.admin_url + 'upload.php'
		}),
		e('div', { className: 'mt-8 text-center sm:text-left border-t border-gray-200 pt-6' },
			e('p', { className: 'text-xs text-gray-500' },
				'Need help? ', e('a', { className: 'text-wp-primary hover:text-wp-primary-hover hover:underline', href: '#' }, 'View documentation')
			)
		),
		// Add progress bar stripes animation
		e('style', null, `
			@keyframes progress-bar-stripes {
				from { background-position: 1rem 0; }
				to { background-position: 0 0; }
			}
			.animate-progress-bar-stripes {
				animation: progress-bar-stripes 1s linear infinite;
			}
		`)
	);
};

document.addEventListener('DOMContentLoaded', () => {
	const root = document.getElementById('wp-bomb-regenerate-thumbnails-root');
	if (root) {
		render(e(RegenerateThumbnailsApp), root);
	}
});
