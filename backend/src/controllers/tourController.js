import {
  getHomeData,
  getTourDetail,
  getTourFilters,
  getTours,
} from "../services/tourService.js";

export async function showHome(_req, res, next) {
  try {
    res.json(await getHomeData());
  } catch (error) {
    next(error);
  }
}

export async function showFilters(_req, res, next) {
  try {
    res.json(await getTourFilters());
  } catch (error) {
    next(error);
  }
}

export async function index(req, res, next) {
  try {
    res.json(await getTours(req.query));
  } catch (error) {
    next(error);
  }
}

export async function show(req, res, next) {
  try {
    res.json(await getTourDetail(req.params.slug));
  } catch (error) {
    next(error);
  }
}
