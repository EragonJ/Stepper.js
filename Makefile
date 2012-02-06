main: sec
	find . | grep '.jade$$' | xargs jade
sec:
	lessc -x public/css/registration-tour.less > public/css/registration-tour.css 
