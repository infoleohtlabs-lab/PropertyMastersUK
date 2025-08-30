import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PropertySearchParams {
  query?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  limit?: number;
  offset?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    if (req.method === 'POST') {
      const searchParams: PropertySearchParams = await req.json()
      
      let query = supabaseClient
        .from('properties')
        .select(`
          *,
          property_images!inner(image_url, alt_text, is_primary),
          users!properties_agent_id_fkey(first_name, last_name, email, phone)
        `)
        .eq('status', 'available')

      // Apply filters
      if (searchParams.query) {
        query = query.or(`title.ilike.%${searchParams.query}%,description.ilike.%${searchParams.query}%,address.ilike.%${searchParams.query}%`)
      }

      if (searchParams.propertyType) {
        query = query.eq('property_type', searchParams.propertyType)
      }

      if (searchParams.minPrice) {
        query = query.gte('price', searchParams.minPrice)
      }

      if (searchParams.maxPrice) {
        query = query.lte('price', searchParams.maxPrice)
      }

      if (searchParams.bedrooms) {
        query = query.gte('bedrooms', searchParams.bedrooms)
      }

      if (searchParams.bathrooms) {
        query = query.gte('bathrooms', searchParams.bathrooms)
      }

      if (searchParams.city) {
        query = query.ilike('city', `%${searchParams.city}%`)
      }

      if (searchParams.county) {
        query = query.ilike('county', `%${searchParams.county}%`)
      }

      // Location-based search using PostGIS
      if (searchParams.latitude && searchParams.longitude) {
        const radius = searchParams.radius || 10 // Default 10km radius
        query = query.rpc('properties_within_radius', {
          lat: searchParams.latitude,
          lng: searchParams.longitude,
          radius_km: radius
        })
      }

      // Pagination
      const limit = searchParams.limit || 20
      const offset = searchParams.offset || 0
      query = query.range(offset, offset + limit - 1)

      // Order by featured first, then by created_at desc
      query = query.order('featured', { ascending: false })
      query = query.order('created_at', { ascending: false })

      const { data: properties, error } = await query

      if (error) {
        throw error
      }

      // Process the results to group images properly
      const processedProperties = properties?.map(property => ({
        ...property,
        images: property.property_images || [],
        agent: property.users || null
      })) || []

      return new Response(
        JSON.stringify({
          success: true,
          data: processedProperties,
          count: processedProperties.length,
          pagination: {
            limit,
            offset,
            hasMore: processedProperties.length === limit
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Handle GET request for featured properties
    if (req.method === 'GET') {
      const { data: featuredProperties, error } = await supabaseClient
        .from('properties')
        .select(`
          *,
          property_images!inner(image_url, alt_text, is_primary),
          users!properties_agent_id_fkey(first_name, last_name, email, phone)
        `)
        .eq('status', 'available')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) {
        throw error
      }

      const processedProperties = featuredProperties?.map(property => ({
        ...property,
        images: property.property_images || [],
        agent: property.users || null
      })) || []

      return new Response(
        JSON.stringify({
          success: true,
          data: processedProperties,
          count: processedProperties.length
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})