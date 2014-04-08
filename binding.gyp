{
	'target_defaults': {
		'libraries': [
			'-lz',
			'-lpng',
			'-ljpeg',
			#'-ltiff',
		],
		'library_dirs': [
		],
		'defines': [
			'WEBP_HAVE_PNG',
			#'WEBP_HAVE_TIFF', #ltiff not available on modulus?
			'WEBP_HAVE_JPEG',
		],
	},
	'targets': [
	{
	 'target_name': 'libwebp_dec',
	  'type': 'static_library',
	  'include_dirs': [
		  '.',
	  ],
	  'sources': [
		'src/dec/alpha.c',
		'src/dec/buffer.c',
		'src/dec/frame.c',
		'src/dec/idec.c',
		'src/dec/io.c',
		'src/dec/layer.c',
		'src/dec/quant.c',
		'src/dec/tree.c',
		'src/dec/vp8.c',
		'src/dec/vp8l.c',
		'src/dec/webp.c',
	  ],
	  'cflags': [ '-w' ],
	},
	{
	  'target_name': 'libwebp_demux',
	  'type': 'static_library',
	  'include_dirs': [
		  '.',
	  ],
	  'sources': [
		'src/demux/demux.c',
	  ],
	  'cflags': [ '-w' ],
	},
	{
	  'target_name': 'libwebp_dsp',
	  'type': 'static_library',
	  'include_dirs': [
		  '.',
	  ],
	  'sources': [
		'src/dsp/cpu.c',
		'src/dsp/dec.c',
		'src/dsp/dec_sse2.c',
		'src/dsp/enc.c',
		'src/dsp/enc_sse2.c',
		'src/dsp/lossless.c',
		'src/dsp/upsampling.c',
		'src/dsp/upsampling_sse2.c',
		'src/dsp/yuv.c',
	  ],
	  'cflags': [ '-w' ],
	},
	{
	  'target_name': 'libwebp_enc',
	  'type': 'static_library',
	  'include_dirs': [
		  '.',
	  ],
	  'sources': [
		'src/enc/alpha.c',
		'src/enc/analysis.c',
		'src/enc/backward_references.c',
		'src/enc/config.c',
		'src/enc/cost.c',
		'src/enc/filter.c',
		'src/enc/frame.c',
		'src/enc/histogram.c',
		'src/enc/iterator.c',
		'src/enc/layer.c',
		'src/enc/picture.c',
		'src/enc/quant.c',
		'src/enc/syntax.c',
		'src/enc/token.c',
		'src/enc/tree.c',
		'src/enc/vp8l.c',
		'src/enc/webpenc.c',
	  ],
	  'cflags': [ '-w' ],
	},
	{
	  'target_name': 'libwebp_utils',
	  'type': 'static_library',
	  'include_dirs': [
		  '.',
	  ],
	  'sources': [
		'src/utils/alpha_processing.c',
		'src/utils/bit_reader.c',
		'src/utils/bit_writer.c',
		'src/utils/color_cache.c',
		'src/utils/filters.c',
		'src/utils/huffman.c',
		'src/utils/random.c',
		'src/utils/huffman_encode.c',
		'src/utils/quant_levels.c',
		'src/utils/quant_levels_dec.c',
		'src/utils/rescaler.c',
		'src/utils/thread.c',
		'src/utils/utils.c',
	  ],
	  'cflags': [ '-w' ],
	},
	{
	  'target_name': 'libwebp',
	  'type': 'none',
	  'dependencies' : [
		'libwebp_dec',
		'libwebp_demux',
		'libwebp_dsp',
		#'libwebp_dsp_neon',
		'libwebp_enc',
		'libwebp_utils',
	  ],
	  'direct_dependent_settings': {
		'include_dirs': [
		  'src',
		],
	  },
	  'cflags': [ '-w' ],
	},
	{
	  'target_name': 'dwebp',
	  'type': 'executable',
	  'dependencies' : [
		'libwebp',
		'libwebp_dec',
		'libwebp_dsp',
		'libwebp_utils',
	  ],
	  'include_dirs': [
		  'src', '.',
	  ],
	  'sources': [
		'examples/dwebp.c',
		'examples/example_util.c',
		'examples/jpegdec.c',
		'examples/metadata.c',
		'examples/pngdec.c',
		'examples/tiffdec.c',
	  ],
	  'cflags': [ '-w' ]
	},
	{
	  'target_name': 'cwebp',
	  'type': 'executable',
	  'dependencies' : [
		'libwebp',
		'libwebp_enc',
		'libwebp_dsp',
		'libwebp_utils',
	  ],
	  'include_dirs': [
		  'src', '.',
	  ],
	  'sources': [
		'examples/cwebp.c',
		'examples/example_util.c',
		'examples/jpegdec.c',
		'examples/metadata.c',
		'examples/pngdec.c',
		'examples/tiffdec.c',
	  ],
	  'cflags': [ '-w' ]
	}
  ]
}