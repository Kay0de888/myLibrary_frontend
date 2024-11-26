new Vue({
    el: '#app',
    data: {
      courses: [], // Array to store courses fetched from the backend
      loading: true, // Flag to show loading indicator
      error: null, // Store error messages if fetching fails
    },
    methods: {
      fetchCourses() {
        // Fetch courses from the backend API using fetch
        fetch('http://localhost:5000/courses') // Backend endpoint
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Parse response as JSON
          })
          .then(data => {
            this.courses = data; // Assign the fetched courses to the courses array
            this.loading = false; // Stop loading
          })
          .catch(err => {
            console.error(err); // Log errors to the console
            this.error = 'Failed to load courses. Please try again later.';
            this.loading = false; // Stop loading even if there's an error
          });
      },
    },
    mounted() {
      // Automatically fetch courses when the app is mounted
      this.fetchCourses();
    },
  });
  