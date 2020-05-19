package com.example.waterteffect

import android.graphics.BitmapFactory
import android.graphics.Point
import android.os.Bundle
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.example.render.GLRippleView
import java.util.concurrent.TimeUnit

// TODO: Rename parameter arguments, choose names that match
// the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
private const val ARG_PARAM1 = "param1"
private const val ARG_PARAM2 = "param2"
private const val ARG_PARAM3 = "param3"

/**
 * A simple [Fragment] subclass.
 * Use the [GLRippleView.newInstance] factory method to
 * create an instance of this fragment.
 */
class GLRippleFragment : Fragment() {

    // TODO: Rename and change types of parameters
    private val mScreenSize = Point()

    private val glRippleView: GLRippleView by lazy {
        requireView().findViewById<GLRippleView>(R.id.water)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requireActivity().windowManager.defaultDisplay.getSize(mScreenSize)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_g_l_ripple_view, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        glRippleView.run {
            listener = object : com.example.render.GLRippleView.Listener {
                override fun onTouchEvent(event: MotionEvent) {
                    if (event.action == MotionEvent.ACTION_DOWN || event.action == MotionEvent.ACTION_MOVE) {
                        setRipplePoint(getRippleCoord(event))
                    }
                }
            }
        }
    }

    override fun onStart() {
        super.onStart()
        glRippleView.onResume()
    }

    override fun onStop() {
        super.onStop()
        glRippleView.onPause()
    }

    private fun getRippleCoord(event: MotionEvent): Pair<Float, Float> {
        return event.x / mScreenSize.x - 0.5f to event.rawY / (mScreenSize.y-150) - 0.5f
    }
}
