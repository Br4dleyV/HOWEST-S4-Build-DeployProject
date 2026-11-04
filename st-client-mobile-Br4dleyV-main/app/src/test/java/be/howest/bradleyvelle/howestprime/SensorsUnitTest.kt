package be.howest.bradleyvelle.howestprime

import be.howest.bradleyvelle.howestprime.domain.repository.FlashlightRepository
import be.howest.bradleyvelle.howestprime.domain.repository.LightSensorRepository
import be.howest.bradleyvelle.howestprime.domain.repository.ProximitySensorRepository
import be.howest.bradleyvelle.howestprime.ui.sensors.SensorsUiState
import be.howest.bradleyvelle.howestprime.ui.sensors.SensorsViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

// ─────────────────────────────────────────────────────────────────────────────
// Fake repositories
// ─────────────────────────────────────────────────────────────────────────────

/** Controllable fake for the light sensor. */
class FakeLightSensorRepository : LightSensorRepository {
    private val _lightIntensity = MutableSharedFlow<Float>(extraBufferCapacity = 1)
    override val lightIntensity = _lightIntensity

    var startListeningCalled = false
    var stopListeningCalled = false

    override fun startListening() { startListeningCalled = true }
    override fun stopListening()  { stopListeningCalled  = true }

    /** Push a new light-intensity value into the flow. */
    suspend fun emit(value: Float) { _lightIntensity.emit(value) }
}

/** Controllable fake for the proximity sensor. */
class FakeProximitySensorRepository : ProximitySensorRepository {
    private val _isNear = MutableSharedFlow<Boolean>(extraBufferCapacity = 1)
    override val isNear = _isNear

    var startListeningCalled = false
    var stopListeningCalled = false

    override fun startListening() { startListeningCalled = true }
    override fun stopListening()  { stopListeningCalled  = true }

    /** Push a new proximity value into the flow. */
    suspend fun emit(value: Boolean) { _isNear.emit(value) }
}

/** Spy for the flashlight repository. */
class FakeFlashlightRepository : FlashlightRepository {
    var lastToggleValue: Boolean? = null

    override fun toggleFlashlight(isEnabled: Boolean) {
        lastToggleValue = isEnabled
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SensorsUiState – pure logic tests (no coroutines needed)
// ─────────────────────────────────────────────────────────────────────────────

class SensorsUiStateTest {

    // ── lightCategory ────────────────────────────────────────────────────────

    @Test
    fun lightCategory_isDark_whenIntensityBelow10() {
        val state = SensorsUiState(lightIntensity = 0f)
        assertEquals("Dark", state.lightCategory)
    }

    @Test
    fun lightCategory_isDark_whenIntensityIs9() {
        val state = SensorsUiState(lightIntensity = 9f)
        assertEquals("Dark", state.lightCategory)
    }

    @Test
    fun lightCategory_isDim_whenIntensityIs10() {
        val state = SensorsUiState(lightIntensity = 10f)
        assertEquals("Dim", state.lightCategory)
    }

    @Test
    fun lightCategory_isDim_whenIntensityIs99() {
        val state = SensorsUiState(lightIntensity = 99f)
        assertEquals("Dim", state.lightCategory)
    }

    @Test
    fun lightCategory_isBright_whenIntensityIs100() {
        val state = SensorsUiState(lightIntensity = 100f)
        assertEquals("Bright", state.lightCategory)
    }

    @Test
    fun lightCategory_isBright_whenIntensityIs1999() {
        val state = SensorsUiState(lightIntensity = 1999f)
        assertEquals("Bright", state.lightCategory)
    }

    @Test
    fun lightCategory_isVeryBright_whenIntensityIs2000() {
        val state = SensorsUiState(lightIntensity = 2000f)
        assertEquals("Very Bright", state.lightCategory)
    }

    @Test
    fun lightCategory_isVeryBright_whenIntensityIsHigh() {
        val state = SensorsUiState(lightIntensity = 50_000f)
        assertEquals("Very Bright", state.lightCategory)
    }

    // ── proximityMessage ─────────────────────────────────────────────────────

    @Test
    fun proximityMessage_showsSeated_whenIsNearTrue() {
        val state = SensorsUiState(isNear = true)
        assertEquals("You appear to be seated", state.proximityMessage)
    }

    @Test
    fun proximityMessage_showsNotSeated_whenIsNearFalse() {
        val state = SensorsUiState(isNear = false)
        assertEquals("You don't appear to be seated", state.proximityMessage)
    }

    // ── default values ────────────────────────────────────────────────────────

    @Test
    fun defaultState_hasZeroLightIntensity() {
        val state = SensorsUiState()
        assertEquals(0f, state.lightIntensity)
    }

    @Test
    fun defaultState_isNotNear() {
        val state = SensorsUiState()
        assertFalse(state.isNear)
    }

    @Test
    fun defaultState_flashlightIsDisabled() {
        val state = SensorsUiState()
        assertFalse(state.isFlashlightEnabled)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SensorsViewModel – coroutine-based tests
// ─────────────────────────────────────────────────────────────────────────────

@OptIn(ExperimentalCoroutinesApi::class)
class SensorsViewModelTest {

    private val testDispatcher = StandardTestDispatcher()

    private lateinit var lightRepo: FakeLightSensorRepository
    private lateinit var proximityRepo: FakeProximitySensorRepository
    private lateinit var flashlightRepo: FakeFlashlightRepository
    private lateinit var viewModel: SensorsViewModel

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        lightRepo      = FakeLightSensorRepository()
        proximityRepo  = FakeProximitySensorRepository()
        flashlightRepo = FakeFlashlightRepository()
        viewModel = SensorsViewModel(lightRepo, proximityRepo, flashlightRepo)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    // ── initial state ─────────────────────────────────────────────────────────

    @Test
    fun initialState_hasDefaultValues() = runTest {
        advanceUntilIdle()
        val state = viewModel.uiState.value
        assertEquals(0f, state.lightIntensity)
        assertFalse(state.isNear)
        assertFalse(state.isFlashlightEnabled)
    }

    // ── light sensor flow ─────────────────────────────────────────────────────

    @Test
    fun uiState_updatesLightIntensity_whenLightSensorEmits() = runTest {
        advanceUntilIdle()
        lightRepo.emit(350f)
        advanceUntilIdle()
        assertEquals(350f, viewModel.uiState.value.lightIntensity)
    }

    @Test
    fun uiState_updatesLightIntensity_withMultipleEmissions() = runTest {
        advanceUntilIdle()
        lightRepo.emit(5f)
        advanceUntilIdle()
        assertEquals(5f, viewModel.uiState.value.lightIntensity)

        lightRepo.emit(3000f)
        advanceUntilIdle()
        assertEquals(3000f, viewModel.uiState.value.lightIntensity)
    }

    // ── proximity sensor flow ─────────────────────────────────────────────────

    @Test
    fun uiState_updatesIsNear_whenProximitySensorEmitsTrue() = runTest {
        advanceUntilIdle()
        proximityRepo.emit(true)
        advanceUntilIdle()
        assertTrue(viewModel.uiState.value.isNear)
    }

    @Test
    fun uiState_updatesIsNear_whenProximitySensorEmitsFalse() = runTest {
        advanceUntilIdle()
        proximityRepo.emit(true)
        advanceUntilIdle()
        proximityRepo.emit(false)
        advanceUntilIdle()
        assertFalse(viewModel.uiState.value.isNear)
    }

    // ── startListening / stopListening ────────────────────────────────────────

    @Test
    fun startListening_callsBothSensorRepositories() = runTest {
        viewModel.startListening()
        assertTrue(lightRepo.startListeningCalled)
        assertTrue(proximityRepo.startListeningCalled)
    }

    @Test
    fun stopListening_callsBothSensorRepositories() = runTest {
        viewModel.stopListening()
        assertTrue(lightRepo.stopListeningCalled)
        assertTrue(proximityRepo.stopListeningCalled)
    }

    // ── toggleFlashlight ──────────────────────────────────────────────────────

    @Test
    fun toggleFlashlight_true_enablesFlashlightInStateAndRepository() = runTest {
        viewModel.toggleFlashlight(true)
        advanceUntilIdle()
        assertTrue(viewModel.uiState.value.isFlashlightEnabled)
        assertEquals(true, flashlightRepo.lastToggleValue)
    }

    @Test
    fun toggleFlashlight_false_disablesFlashlightInStateAndRepository() = runTest {
        viewModel.toggleFlashlight(true)
        advanceUntilIdle()
        viewModel.toggleFlashlight(false)
        advanceUntilIdle()
        assertFalse(viewModel.uiState.value.isFlashlightEnabled)
        assertEquals(false, flashlightRepo.lastToggleValue)
    }

    @Test
    fun toggleFlashlight_doesNotAffectOtherStateFields() = runTest {
        lightRepo.emit(250f)
        proximityRepo.emit(true)
        advanceUntilIdle()

        viewModel.toggleFlashlight(true)
        advanceUntilIdle()

        val state = viewModel.uiState.value
        assertEquals(250f, state.lightIntensity)
        assertTrue(state.isNear)
    }

    // ── combined sensor updates ───────────────────────────────────────────────

    @Test
    fun uiState_reflectsBothSensors_simultaneously() = runTest {
        advanceUntilIdle()
        lightRepo.emit(800f)
        proximityRepo.emit(true)
        advanceUntilIdle()

        val state = viewModel.uiState.value
        assertEquals(800f, state.lightIntensity)
        assertTrue(state.isNear)
        assertEquals("Bright", state.lightCategory)
        assertEquals("You appear to be seated", state.proximityMessage)
    }
}