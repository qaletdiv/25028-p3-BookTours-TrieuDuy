import {
  findActiveBanners,
  findDepartures,
  findDestinations,
  findTourPriceOptions,
  findTourTypes,
} from "../models/catalogModel.js";
import {
  findHotTours,
  findRelatedTours,
  findTourBySlug,
  findTourDepartures,
  findTourImages,
  findTourItinerary,
  findTourSuggestions,
  findTours,
  findToursByRegion,
} from "../models/tourModel.js";
import ApiError from "../utils/ApiError.js";

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toOptionalNumber(value) {
  if (value === undefined || value === "") return undefined;
  return Number(value);
}

function mapTour(tour) {
  return {
    ...tour,
    price: Number(tour.price),
    original_price: tour.original_price ? Number(tour.original_price) : null,
    rating: Number(tour.rating),
    is_hot: Boolean(tour.is_hot),
  };
}

function parseJson(value) {
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value || "[]");
  } catch {
    return [];
  }
}

export async function getHomeData() {
  const [banners, hot, domestic, international] = await Promise.all([
    findActiveBanners(),
    findHotTours(),
    findToursByRegion("domestic"),
    findToursByRegion("international"),
  ]);

  return {
    banners,
    sections: {
      hot: hot.map(mapTour),
      domestic: domestic.map(mapTour),
      international: international.map(mapTour),
    },
  };
}

export async function getTourFilters() {
  const [destinations, departures, types, prices] = await Promise.all([
    findDestinations(),
    findDepartures(),
    findTourTypes(),
    findTourPriceOptions(),
  ]);
  return { destinations, departures, types, prices };
}

export async function getTours(query) {
  const page = Math.max(1, toNumber(query.page, 1));
  const limit = Math.min(24, Math.max(1, toNumber(query.limit, 9)));
  const filters = {
    destination: query.destination,
    departure: query.departure,
    type: query.type,
    region: query.region,
    keyword: query.keyword?.trim(),
    minPrice: toOptionalNumber(query.minPrice),
    maxPrice: toOptionalNumber(query.maxPrice),
    minDays: toOptionalNumber(query.minDays),
    maxDays: toOptionalNumber(query.maxDays),
    startDate: query.startDate,
  };
  const pagination = {
    page,
    limit,
    offset: (page - 1) * limit,
    sort: query.sort || "newest",
  };
  const { rows, total } = await findTours(filters, pagination);

  return {
    data: rows.map(mapTour),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getTourSuggestions(keyword) {
  const normalizedKeyword = keyword.trim();
  const rows = await findTourSuggestions(normalizedKeyword);
  return rows.map((tour) => ({
    ...tour,
    price: Number(tour.price),
  }));
}

export async function getTourDetail(slug) {
  const tour = await findTourBySlug(slug);
  if (!tour) {
    throw new ApiError(404, "Không tìm thấy tour.");
  }

  const [images, departures, itinerary, related] = await Promise.all([
    findTourImages(tour.id),
    findTourDepartures(tour.id),
    findTourItinerary(tour.id),
    findRelatedTours(tour),
  ]);

  return {
    ...mapTour(tour),
    highlights: parseJson(tour.highlights),
    included: parseJson(tour.included),
    excluded: parseJson(tour.excluded),
    policy: parseJson(tour.policy),
    images,
    departures,
    itinerary,
    related: related.map(mapTour),
  };
}
