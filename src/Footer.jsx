import React, { useState, useEffect } from "react";

const Footer = () => {
  const [logoUrl, setLogoUrl] = useState(""); // State to store the logo URL

  // Fetch the logo from the API
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/home-descriptions");
        const data = await response.json();
        if (data && data.logo_url) {
          setLogoUrl(data.logo_url); // Assuming the API provides the logo URL in `logo_url`
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    };

    fetchLogo();
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-start">
        {/* Dynamic Logo */}
        <div className="mb-6 md:mb-0">
          <img
            src={logoUrl || "./assets/labol2is.png"} // Fallback to default if logo URL is not available
            alt="Laboratory Logo"
            className="h-16 w-auto"
          />
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Informations</h3>
          <div className="space-y-3">
            {/* Address */}
            <div className="flex items-start">
              <span className="text-blue-400 mr-3 mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </span>
              <p className="text-gray-300">
                Faculté des Sciences et Techniques, B.P 549, Av. Abdelkarim Elkhattabi, Guéliz Marrakech
              </p>
            </div>

            {/* Phone */}
            <div className="flex items-center">
              <span className="text-blue-400 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </span>
              <p className="text-gray-300">(+212) 524 43 34 04</p>
            </div>

            {/* Fax */}
            <div className="flex items-center">
              <span className="text-blue-400 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
              </span>
              <p className="text-gray-300">(+212) 524 43 31 70</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
        <p className="text-sm">
          © {new Date().getFullYear()} L2IS - Laboratoire d'Ingénierie Informatique et Systèmes. 
        </p>
      </div>
    </footer>
  );
};

export default Footer;