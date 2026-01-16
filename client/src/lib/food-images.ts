import riceImg from "@assets/stock_images/white_rice_bowl_kore_781d6b5f.jpg";
import brownRiceImg from "@assets/stock_images/brown_rice_healthy_g_17511ca8.jpg";
import breadImg from "@assets/stock_images/multigrain_bread_who_6c18bd2e.jpg";
import sweetPotatoImg from "@assets/stock_images/sweet_potato_korean_e776bb1a.jpg";
import potatoImg from "@assets/stock_images/boiled_potato_vegeta_da61c43a.jpg";
import spinachImg from "@assets/stock_images/spinach_fresh_green__ec4a1689.jpg";
import cucumberImg from "@assets/stock_images/cucumber_fresh_veget_84c2f3a5.jpg";
import carrotImg from "@assets/stock_images/carrot_fresh_orange__51387830.jpg";
import cabbageImg from "@assets/stock_images/cabbage_vegetable_gr_97b14e99.jpg";
import tomatoImg from "@assets/stock_images/tomato_fresh_red_veg_71930626.jpg";
import broccoliImg from "@assets/stock_images/broccoli_green_veget_8a9ce9b3.jpg";
import lettuceImg from "@assets/stock_images/lettuce_fresh_salad__40f14f92.jpg";
import mushroomImg from "@assets/stock_images/shiitake_mushroom_as_7c37f0a6.jpg";
import bananaImg from "@assets/stock_images/banana_fruit_yellow_fd8a2338.jpg";
import appleImg from "@assets/stock_images/apple_red_fruit_fres_85013ecb.jpg";
import grapesImg from "@assets/stock_images/grapes_purple_fruit__2ce6f91b.jpg";
import watermelonImg from "@assets/stock_images/watermelon_slice_sum_4cf0430c.jpg";
import orangeImg from "@assets/stock_images/orange_citrus_fruit__c7518279.jpg";
import strawberryImg from "@assets/stock_images/strawberry_red_berry_2fd11ef8.jpg";
import kiwiImg from "@assets/stock_images/kiwi_fruit_green_sli_e145e12a.jpg";
import chickenImg from "@assets/stock_images/grilled_chicken_brea_b7e30200.jpg";
import porkImg from "@assets/stock_images/korean_pork_belly_sa_9db8a079.jpg";
import tofuImg from "@assets/stock_images/tofu_korean_soybean_37f3ee63.jpg";
import eggImg from "@assets/stock_images/boiled_egg_healthy_b_c2672d40.jpg";
import mackerelImg from "@assets/stock_images/grilled_mackerel_fis_c70fd40b.jpg";
import beefImg from "@assets/stock_images/beef_steak_meat_4366d754.jpg";
import milkImg from "@assets/stock_images/milk_glass_dairy_72877c88.jpg";
import ramenImg from "@assets/stock_images/instant_ramen_noodle_640ade47.jpg";
import colaImg from "@assets/stock_images/cola_soft_drink_soda_f11bda83.jpg";
import chipsImg from "@assets/stock_images/potato_chips_snack_9ea30109.jpg";
import defaultFoodImg from "@assets/stock_images/korean_food_healthy__e50e48e7.jpg";

const foodImageMap: Record<string, string> = {
  "흰쌀밥": riceImg,
  "현미밥": brownRiceImg,
  "잡곡빵": breadImg,
  "고구마 (찐 것)": sweetPotatoImg,
  "감자 (삶은 것)": potatoImg,
  "시금치 (생것)": spinachImg,
  "오이": cucumberImg,
  "당근 (생것)": carrotImg,
  "양배추 (삶은 것)": cabbageImg,
  "토마토": tomatoImg,
  "브로콜리 (삶은 것)": broccoliImg,
  "상추": lettuceImg,
  "표고버섯": mushroomImg,
  "바나나": bananaImg,
  "사과 (껍질 포함)": appleImg,
  "포도": grapesImg,
  "수박": watermelonImg,
  "오렌지": orangeImg,
  "딸기": strawberryImg,
  "키위": kiwiImg,
  "닭가슴살 (삶은 것)": chickenImg,
  "삼겹살 (구운 것)": porkImg,
  "두부": tofuImg,
  "계란 (삶은 것)": eggImg,
  "고등어 (구운 것)": mackerelImg,
  "소고기 (살코기)": beefImg,
  "저지방 우유": milkImg,
  "라면": ramenImg,
  "콜라": colaImg,
  "감자칩": chipsImg,
};

const categoryImageMap: Record<string, string> = {
  "곡류": riceImg,
  "채소": spinachImg,
  "과일": appleImg,
  "단백질": chickenImg,
  "가공식품": ramenImg,
};

export function getFoodImage(foodName: string, category?: string): string {
  if (foodImageMap[foodName]) {
    return foodImageMap[foodName];
  }
  
  if (category && categoryImageMap[category]) {
    return categoryImageMap[category];
  }
  
  return defaultFoodImg;
}

export { defaultFoodImg };
