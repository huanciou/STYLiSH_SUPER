function useTapPay() {
  React.useEffect(() => {
    TPDirect.setupSDK(
      "12348",
      "app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF",
      "sandbox"
    );
    TPDirect.card.setup({
      fields: {
        number: {
          element: "#card-number",
          placeholder: "**** **** **** ****",
        },
        expirationDate: {
          element: "#card-expiration-date",
          placeholder: "MM / YY",
        },
        ccv: {
          element: "#card-ccv",
          placeholder: "後三碼",
        },
      },
      styles: {
        ".valid": {
          color: "green",
        },
        ".invalid": {
          color: "red",
        },
      },
    });
  }, []);
}

export default useTapPay;
