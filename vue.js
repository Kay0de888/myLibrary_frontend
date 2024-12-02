new Vue({
    el: "#app",
    data: {
      currentPage: "index", 
      courses: [], 
      cart: [], 
      searchQuery: "", 
      loading: true, 
      error: null, 
      sortKey: "title", 
      sortOrder: "asc", 
      checkoutForm: {
        name: "",
        phone: "",
      }, 
      successMessage: "", 
    },
    computed: {
      
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
      
      togglePage() {
        this.currentPage = this.currentPage === "index" ? "checkout" : "index";
      },
      
      addToCart(course) {
        const index = this.courses.findIndex((c) => c._id === course._id);
        if (index !== -1 && this.courses[index].spacesAvailable > 0) {
          this.courses[index].spacesAvailable -= 1; 
          this.cart.push({ ...course }); 
        }
      },
      
      removeFromCart(course) {
        const index = this.cart.findIndex((c) => c._id === course._id);
        if (index !== -1) {
          this.cart.splice(index, 1); 
          
          const courseIndex = this.courses.findIndex((c) => c._id === course._id);
          if (courseIndex !== -1) {
            this.courses[courseIndex].spacesAvailable += 1;
          }
        }
      },
      
      sortCourses(key) {
        this.sortKey = key;
      },
      
      toggleSortOrder() {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      },
      
      fetchCourses() {
        this.loading = true;
        this.error = null;
        fetch("http://localhost:5000/api/courses") 
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch courses");
            }
            return response.json();
          })
          .then((data) => {
            this.courses = data; 
          })
          .catch((err) => {
            this.error = "Error retrieving courses: " + err.message;
          })
          .finally(() => {
            this.loading = false; 
          });
      },
      
      checkout() {
        if (this.isNameValid && this.isPhoneValid && this.cart.length > 0) {
          const orderData = {
            name: this.checkoutForm.name,
            phone: this.checkoutForm.phone,
            cart: this.cart,
          };
  
          
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
                this.error = data.error; 
              } else {
                this.successMessage = data.message; 
                this.cart = []; 
                this.checkoutForm.name = ""; 
                this.checkoutForm.phone = "";
              }
            })
            .catch((err) => {
              this.error = "Error during checkout: " + err.message;
            });
        } else {
          this.error = "Please enter valid information."; 
        }
      },
    },
    mounted() {
      this.fetchCourses(); 
    },
  });
  