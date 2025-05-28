import axiosInstance from './axios.ts';

export interface PriceCalculationRequest {
  cargoType: string;
  pickCity: string;
  pickCountry: string;
  deliveryCity: string;
  deliveryCountry: string;
  weight: number;
}

export interface PriceCalculationResponse {
  price: {
    prediction: number;
    minPrice: number;
    maxPrice: number;
  };
  distance: number;
  duration: string;
  origin: string;
  destination: string;
}

/**
 * Calculates the price prediction for a cargo transport
 * @param requestData The cargo and route details
 * @returns Price prediction, distance, duration and location details
 */
export const calculatePrice = async (requestData: PriceCalculationRequest): Promise<PriceCalculationResponse> => {
  try {
    const response = await axiosInstance.post('api/CalculatePrice/calculate', requestData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Fiyat hesaplaması yapılamadı');
  }
};

/**
 * Simplified function to get only the price prediction
 * @param requestData The cargo and route details
 * @returns Just the predicted price value
 */
export const getPricePrediction = async (requestData: PriceCalculationRequest): Promise<number> => {
  try {
    const response = await calculatePrice(requestData);
    return response.price.prediction;
  } catch (error) {
    throw error;
  }
};

/**
 * Get price range (min and max) for a cargo transport
 * @param requestData The cargo and route details
 * @returns Object containing min and max price values
 */
export const getPriceRange = async (requestData: PriceCalculationRequest): Promise<{min: number, max: number}> => {
  try {
    const response = await calculatePrice(requestData);
    return {
      min: response.price.minPrice,
      max: response.price.maxPrice
    };
  } catch (error) {
    throw error;
  }
};
