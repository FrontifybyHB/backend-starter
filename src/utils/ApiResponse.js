/**
 * ApiResponse Utility
 * Purpose: Send all API responses with one consistent shape.
 */
class ApiResponse {
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
    });
  }

  static paginated(res, data, pagination, message = 'Fetched successfully') {
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message,
      data,
      pagination,
    });
  }

  static error(res, message, statusCode = 500, errors = []) {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      ...(errors.length && { errors }),
    });
  }
}

export default ApiResponse;
