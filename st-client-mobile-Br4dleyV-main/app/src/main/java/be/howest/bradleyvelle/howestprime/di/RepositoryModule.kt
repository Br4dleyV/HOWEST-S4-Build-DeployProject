package be.howest.bradleyvelle.howestprime.di

import be.howest.bradleyvelle.howestprime.data.repository.CartRepositoryImpl
import be.howest.bradleyvelle.howestprime.data.repository.LocationRepositoryImpl
import be.howest.bradleyvelle.howestprime.data.repository.OrderRepositoryImpl
import be.howest.bradleyvelle.howestprime.data.repository.SnackRepositoryImpl
import be.howest.bradleyvelle.howestprime.data.repository.LightSensorRepositoryImpl
import be.howest.bradleyvelle.howestprime.data.repository.ProximitySensorRepositoryImpl
import be.howest.bradleyvelle.howestprime.data.repository.FlashlightRepositoryImpl
import be.howest.bradleyvelle.howestprime.data.repository.TicketRepositoryImpl
import be.howest.bradleyvelle.howestprime.domain.repository.CartRepository
import be.howest.bradleyvelle.howestprime.domain.repository.LocationRepository
import be.howest.bradleyvelle.howestprime.domain.repository.OrderRepository
import be.howest.bradleyvelle.howestprime.domain.repository.SnackRepository
import be.howest.bradleyvelle.howestprime.domain.repository.LightSensorRepository
import be.howest.bradleyvelle.howestprime.domain.repository.ProximitySensorRepository
import be.howest.bradleyvelle.howestprime.domain.repository.FlashlightRepository
import be.howest.bradleyvelle.howestprime.domain.repository.TicketRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

// This module maps the interfaces to their implementations
// For example, CartRepository and CartRepositoryImpl
// This way there is Dependency Inversion,
// decoupling business logic from data access logic
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    abstract fun bindCartRepository(
        impl: CartRepositoryImpl
    ): CartRepository

    @Binds
    abstract fun bindOrderRepository(
        impl: OrderRepositoryImpl
    ): OrderRepository

    @Binds
    abstract fun bindSnackRepository(
        impl: SnackRepositoryImpl
    ): SnackRepository

    @Binds
    abstract fun bindLocationRepository(
        impl: LocationRepositoryImpl
    ): LocationRepository

    @Binds
    abstract fun bindLightSensorRepository(
        impl: LightSensorRepositoryImpl
    ): LightSensorRepository

    @Binds
    abstract fun bindProximitySensorRepository(
        impl: ProximitySensorRepositoryImpl
    ): ProximitySensorRepository

    @Binds
    abstract fun bindFlashlightRepository(
        impl: FlashlightRepositoryImpl
    ): FlashlightRepository

    @Binds
    abstract fun bindTicketRepository(
        impl: TicketRepositoryImpl
    ): TicketRepository
}