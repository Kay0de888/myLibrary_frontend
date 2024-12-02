new Vue({
    el: "#app",
    data: {
      currentPage: "index", // Tracks the current page ("index" or "checkout")
      courses: [], // All available courses
      cart: [], // List of courses added to the cart
      searchQuery: "", // For search functionality
      loading: true, // Indicates loading state
      error: null, // Stores error messages
      sortKey: "title", // Default sort key
      sortOrder: "asc", // Default sort order (ascending)
      checkoutForm: {
        name: "",
        phone: "",
      }, // Data for checkout form
      successMessage: "", // Success message for checkout
    },
    computed: {
      // Filtered courses based on the search query
      filteredCourses() {
        const query = this.searchQuery.toLowerCase();
        return this.courses
          .filter(
            (course) =>
              course.title.toLowerCase().includes(query) ||
              course.location.toLowerCase().includes(query) ||
              course.price.toString().includes(query)
          )
          .sort((a, b) => {
            let result = 0;
            if (a[this.sortKey] < b[this.sortKey]) result = -1;
            if (a[this.sortKey] > b[this.sortKey]) result = 1;
            return this.sortOrder === "asc" ? result : -result;
          });
      },
      // Count of items in the cart
      cartCount() {
        return this.cart.length;
      },
      // Validate name (only letters)
      isNameValid() {
        return /^[A-Za-z\s]+$/.test(this.checkoutForm.name);
      },
      // Validate phone number (only numbers)
      isPhoneValid() {
        return /^[0-9]+$/.test(this.checkoutForm.phone);
      },
    },
    methods: {
      // Toggle between "index" and "checkout" pages
      togglePage() {
        this.currentPage = this.currentPage === "index" ? "checkout" : "index";
      },
      // Add a course to the cart
      addToCart(course) {
        const index = this.courses.findIndex((c) => c._id === course._id);
        if (index !== -1 && this.courses[index].spacesAvailable > 0) {
          this.courses[index].spacesAvailable -= 1; // Reduce available spaces
          this.cart.push({ ...course }); // Add to cart
        }
      },
      // Remove a course from the cart
      removeFromCart(course) {
        const index = this.cart.findIndex((c) => c._id === course._id);
        if (index !== -1) {
          this.cart.splice(index, 1); // Remove from cart
          // Restore available spaces in the courses list
          const courseIndex = this.courses.findIndex((c) => c._id === course._id);
          if (courseIndex !== -1) {
            this.courses[courseIndex].spacesAvailable += 1;
          }
        }
      },
      // Sort courses based on a key (e.g., "price", "location", "title")
      sortCourses(key) {
        this.sortKey = key;
      },
      // Toggle between ascending and descending order
      toggleSortOrder() {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      },
      // Fetch courses from the backend
      fetchCourses() {
        this.loading = true;
        this.error = null;
        fetch("http://localhost:5000/api/courses") // Full URL for the backend
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch courses");
            }
            return response.json();
          })
          .then((data) => {
            this.courses = data; // Populate the courses array
          })
          .catch((err) => {
            this.error = "Error retrieving courses: " + err.message;
          })
          .finally(() => {
            this.loading = false; // End loading state
          });
      },
      // Handle the checkout process
      checkout() {
        if (this.isNameValid && this.isPhoneValid && this.cart.length > 0) {
          const orderData = {
            name: this.checkoutForm.name,
            phone: this.checkoutForm.phone,
            cart: this.cart,
          };
  
          // Send POST request to the server
          fetch("http://localhost:5000/checkout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.error) {
                this.error = data.error; // Display server-side error
              } else {
                this.successMessage = data.message; // Show success message from server
                this.cart = []; // Clear the cart after checkout
                this.checkoutForm.name = ""; // Reset form fields
                this.checkoutForm.phone = "";
              }
            })
            .catch((err) => {
              this.error = "Error during checkout: " + err.message;
            });
        } else {
          this.error = "Please enter valid information."; // Show validation error message
        }
      },
    },
    mounted() {
      this.fetchCourses(); // Fetch courses when the app is mounted
    },
  });
  