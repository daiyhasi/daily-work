package com.daiyhasi.dailywork.scroll

import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.scroll.ReactScrollView
import com.facebook.react.views.scroll.ReactScrollViewManager

class ElasticReactScrollViewManager : ReactScrollViewManager() {
  override fun getName(): String = REACT_CLASS

  override fun createViewInstance(context: ThemedReactContext): ReactScrollView =
    ElasticReactScrollView(context)

  @ReactProp(name = "elasticEnabled", defaultBoolean = true)
  fun setElasticEnabled(view: ElasticReactScrollView, enabled: Boolean) {
    view.elasticEnabled = enabled
  }

  @ReactProp(name = "maxOverscrollDistance", defaultFloat = 92f)
  fun setMaxOverscrollDistance(view: ElasticReactScrollView, value: Float) {
    view.maxOverscrollDistance = value * view.resources.displayMetrics.density
  }

  @ReactProp(name = "dragResistance", defaultFloat = 0.42f)
  fun setDragResistance(view: ElasticReactScrollView, value: Float) {
    view.dragResistance = value.coerceIn(0.1f, 0.9f)
  }

  @ReactProp(name = "springStiffness", defaultFloat = 520f)
  fun setSpringStiffness(view: ElasticReactScrollView, value: Float) {
    view.springStiffness = value.coerceAtLeast(1f)
  }

  @ReactProp(name = "springDamping", defaultFloat = 0.82f)
  fun setSpringDamping(view: ElasticReactScrollView, value: Float) {
    view.springDamping = value.coerceIn(0.1f, 1f)
  }

  @ReactProp(name = "flingVelocityMultiplier", defaultFloat = 1.35f)
  fun setFlingVelocityMultiplier(view: ElasticReactScrollView, value: Float) {
    view.flingVelocityMultiplier = value.coerceIn(1f, 2.2f)
  }

  companion object {
    const val REACT_CLASS = "DailyWorkElasticScrollView"
  }
}
