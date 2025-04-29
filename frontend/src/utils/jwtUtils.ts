export const decodeJwtToken = (token: string) => {
  try {
    // Lấy phần payload của token (phần giữa 2 dấu chấm)
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
};

export const getUserIdFromToken = (token: string): number | null => {
  try {
    const decodedToken = decodeJwtToken(token);
    if (!decodedToken?.sub) {
      console.error("No sub field found in token");
      return null;
    }

    // Lấy user ID từ email (sub)
    const userId = parseInt(decodedToken.sub.split("@")[0]);
    if (isNaN(userId)) {
      console.error("Could not parse user ID from email");
      return null;
    }

    return userId;
  } catch (error) {
    console.error("Error getting user ID from token:", error);
    return null;
  }
};

export const getEmailFromToken = (token: string): string | null => {
  try {
    const decodedToken = decodeJwtToken(token);
    if (!decodedToken?.sub) {
      console.error("No sub field found in token");
      return null;
    }
    return decodedToken.sub;
  } catch (error) {
    console.error("Error getting email from token:", error);
    return null;
  }
};
