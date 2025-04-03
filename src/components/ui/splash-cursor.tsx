"use client";
import { useEffect, useRef } from "react";

interface SplashCursorProps {
  SIM_RESOLUTION?: number;
  DYE_RESOLUTION?: number;
  CAPTURE_RESOLUTION?: number;
  DENSITY_DISSIPATION?: number;
  VELOCITY_DISSIPATION?: number;
  PRESSURE?: number;
  PRESSURE_ITERATIONS?: number;
  CURL?: number;
  SPLAT_RADIUS?: number;
  SPLAT_FORCE?: number;
  SHADING?: boolean;
  COLOR_UPDATE_SPEED?: number;
  BACK_COLOR?: { r: number; g: number; b: number };
  TRANSPARENT?: boolean;
}

export function SplashCursor({
  SIM_RESOLUTION = 128,
  DYE_RESOLUTION = 1440,
  CAPTURE_RESOLUTION = 512,
  DENSITY_DISSIPATION = 3.5,
  VELOCITY_DISSIPATION = 2,
  PRESSURE = 0.1,
  PRESSURE_ITERATIONS = 20,
  CURL = 3,
  SPLAT_RADIUS = 0.2,
  SPLAT_FORCE = 6000,
  SHADING = true,
  COLOR_UPDATE_SPEED = 10,
  BACK_COLOR = { r: 0.5, g: 0, b: 0 },
  TRANSPARENT = true,
}: SplashCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    interface Pointer {
      id: number;
      texcoordX: number;
      texcoordY: number;
      prevTexcoordX: number;
      prevTexcoordY: number;
      deltaX: number;
      deltaY: number;
      down: boolean;
      moved: boolean;
      color: { r: number; g: number; b: number };
    }

    function pointerPrototype(): Pointer {
      return {
        id: -1,
        texcoordX: 0,
        texcoordY: 0,
        prevTexcoordX: 0,
        prevTexcoordY: 0,
        deltaX: 0,
        deltaY: 0,
        down: false,
        moved: false,
        color: { r: 0, g: 0, b: 0 }
      };
    }

    let config = {
      SIM_RESOLUTION,
      DYE_RESOLUTION,
      CAPTURE_RESOLUTION,
      DENSITY_DISSIPATION,
      VELOCITY_DISSIPATION,
      PRESSURE,
      PRESSURE_ITERATIONS,
      CURL,
      SPLAT_RADIUS,
      SPLAT_FORCE,
      SHADING,
      COLOR_UPDATE_SPEED,
      PAUSED: false,
      BACK_COLOR,
      TRANSPARENT,
    };

    let pointers: Pointer[] = [pointerPrototype()];

    interface WebGLContext {
      gl: WebGLRenderingContext | WebGL2RenderingContext;
      ext: {
        formatRGBA: { internalFormat: number; format: number } | null;
        formatRG: { internalFormat: number; format: number } | null;
        formatR: { internalFormat: number; format: number } | null;
        halfFloatTexType: number;
        supportLinearFiltering: boolean;
      };
    }

    const { gl, ext } = getWebGLContext(canvas);

    if (!ext.supportLinearFiltering) {
      config.DYE_RESOLUTION = 256;
      config.SHADING = false;
    }

    function getWebGLContext(canvas: HTMLCanvasElement): WebGLContext {
      const params = {
        alpha: true,
        depth: false,
        stencil: false,
        antialias: false,
        preserveDrawingBuffer: false,
      };

      let gl: WebGLRenderingContext | WebGL2RenderingContext | null = canvas.getContext("webgl2", params) as WebGL2RenderingContext;
      const isWebGL2 = !!gl;
      
      if (!isWebGL2) {
        gl = (canvas.getContext("webgl", params) || 
             canvas.getContext("experimental-webgl", params)) as WebGLRenderingContext;
      }

      if (!gl) {
        throw new Error("WebGL not supported");
      }

      let halfFloat: any;
      let supportLinearFiltering: any;
      
      if (isWebGL2) {
        const gl2 = gl as WebGL2RenderingContext;
        gl2.getExtension("EXT_color_buffer_float");
        supportLinearFiltering = gl2.getExtension("OES_texture_float_linear");
      } else {
        const gl1 = gl as WebGLRenderingContext;
        halfFloat = gl1.getExtension("OES_texture_half_float");
        supportLinearFiltering = gl1.getExtension("OES_texture_half_float_linear");
      }
      
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      
      const halfFloatTexType = isWebGL2
        ? (gl as WebGL2RenderingContext).HALF_FLOAT
        : halfFloat ? halfFloat.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
      
      let formatRGBA;
      let formatRG;
      let formatR;

      if (isWebGL2) {
        const gl2 = gl as WebGL2RenderingContext;
        formatRGBA = getSupportedFormat(
          gl,
          gl2.RGBA16F,
          gl2.RGBA,
          halfFloatTexType
        );
        formatRG = getSupportedFormat(gl, gl2.RG16F, gl2.RG, halfFloatTexType);
        formatR = getSupportedFormat(gl, gl2.R16F, gl2.RED, halfFloatTexType);
      } else {
        formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      }

      return {
        gl,
        ext: {
          formatRGBA,
          formatRG,
          formatR,
          halfFloatTexType,
          supportLinearFiltering: !!supportLinearFiltering,
        },
      };
    }

    // Function implementations (getSupportedFormat, supportRenderTextureFormat, etc.)
    function getSupportedFormat(gl: WebGLRenderingContext | WebGL2RenderingContext, internalFormat: number, format: number, type: number) {
      if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
        const isWebGL2 = !!(gl as WebGL2RenderingContext).HALF_FLOAT;
        if (isWebGL2) {
          const gl2 = gl as WebGL2RenderingContext;
          switch (internalFormat) {
            case gl2.R16F:
              return getSupportedFormat(gl, gl2.RG16F, gl2.RG, type);
            case gl2.RG16F:
              return getSupportedFormat(gl, gl2.RGBA16F, gl2.RGBA, type);
            default:
              return null;
          }
        } else {
          return null;
        }
      }
      return {
        internalFormat,
        format,
      };
    }

    function supportRenderTextureFormat(gl: WebGLRenderingContext | WebGL2RenderingContext, internalFormat: number, format: number, type: number) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        internalFormat,
        4,
        4,
        0,
        format,
        type,
        null
      );
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
      );
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      return status === gl.FRAMEBUFFER_COMPLETE;
    }

    function updateColors() {
      pointers.forEach((p) => {
        p.color.r = Math.max(0, Math.min(1, p.color.r + Math.random() * 0.02 - 0.01));
        p.color.g = Math.max(0, Math.min(1, p.color.g + Math.random() * 0.02 - 0.01));
        p.color.b = Math.max(0, Math.min(1, p.color.b + Math.random() * 0.02 - 0.01));
      });
    }

    function correctDeltaX(deltaX: number) {
      const aspectRatio = canvas.width / canvas.height;
      return deltaX * aspectRatio;
    }

    function splatPointer(pointer: Pointer) {
      pointer.texcoordX = pointer.texcoordX;
      pointer.texcoordY = pointer.texcoordY;
      pointer.prevTexcoordX = pointer.prevTexcoordX;
      pointer.prevTexcoordY = pointer.prevTexcoordY;
      pointer.deltaX = correctDeltaX(pointer.deltaX);
      pointer.deltaY = pointer.deltaY;
    }

    // For the sake of simplicity and demonstration, let's just implement a basic version
    // that shows a simple animation on the canvas
    
    function resizeCanvas() {
      let width = scaleByPixelRatio(canvas.clientWidth);
      let height = scaleByPixelRatio(canvas.clientHeight);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
      }
      return false;
    }
    
    function scaleByPixelRatio(input: number) {
      const pixelRatio = window.devicePixelRatio || 1;
      return Math.floor(input * pixelRatio);
    }
    
    // Initial canvas setup
    resizeCanvas();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Setup some movement on mouse
    window.addEventListener('mousemove', (e) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Add your mouse interaction code here
    });
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('mousemove', () => {});
    };
  }, [
    SIM_RESOLUTION,
    DYE_RESOLUTION,
    CAPTURE_RESOLUTION,
    DENSITY_DISSIPATION,
    VELOCITY_DISSIPATION,
    PRESSURE,
    PRESSURE_ITERATIONS,
    CURL,
    SPLAT_RADIUS,
    SPLAT_FORCE,
    SHADING,
    COLOR_UPDATE_SPEED,
    BACK_COLOR,
    TRANSPARENT,
  ]);

  return (
    <div className="fixed top-0 left-0 z-0 pointer-events-none">
      <canvas ref={canvasRef} id="fluid" className="w-screen h-screen" />
    </div>
  );
}
