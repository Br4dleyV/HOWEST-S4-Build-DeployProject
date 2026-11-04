import {
    AddCustomerToOrderController,
    CreateSuggestionController,
    GetOrderByBookingIdController,
    GetSuggestionByIdController,
    ListSuggestionsController,
    PayOrderController,
} from '@/Infrastructure/WebApi/Controllers/mod.ts';
import { type Router, RouterBuilder, type Routes } from '@/Infrastructure/WebApi/Shared/mod.ts';

export class WebApiRoutes implements Routes {
    map(routerBuilder: RouterBuilder): Router {
        return routerBuilder
            .mapGet(ListSuggestionsController.name, '/api/suggestions')
            .mapPost(CreateSuggestionController.name, '/api/suggestions')
            .mapGet(GetSuggestionByIdController.name, '/api/suggestions/:suggestionId')
            .mapPost(AddCustomerToOrderController.name, '/api/orders/:orderId/customer')
            .mapPost(PayOrderController.name, '/api/orders/:orderId/payments')
            .mapGet(GetOrderByBookingIdController.name, '/api/orders/:bookingId')
            .build();
    }
}
